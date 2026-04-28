package com.pos.backend.service;

import com.pos.backend.dto.request.OrderRequest;
import com.pos.backend.dto.request.ReturnRequest;
import com.pos.backend.dto.response.OrderResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.entity.*;
import com.pos.backend.enums.*;
import com.pos.backend.exception.*;
import com.pos.backend.repository.*;
import com.pos.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryService inventoryService;
    private final CustomerService customerService;
    private final CouponService couponService;
    private final CouponRepository couponRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        User cashier = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        PaymentMethod paymentMethod;
        try {
            paymentMethod = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment method: " + request.getPaymentMethod());
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .cashier(cashier)
                .paymentMethod(paymentMethod)
                .status(OrderStatus.COMPLETED)
                .notes(request.getNotes())
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .build();

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
            order.setCustomer(customer);
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new InsufficientStockException(product.getName(), itemReq.getQuantity(), product.getStock());
            }

            BigDecimal unitPrice = product.getSellingPrice();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .productSku(product.getSku())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .costPrice(product.getCostPrice())
                    .totalPrice(totalPrice)
                    .build();

            order.addItem(orderItem);
            subtotal = subtotal.add(totalPrice);

            if (product.getTaxRate() != null && product.getTaxRate().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal itemTax = totalPrice.multiply(product.getTaxRate()).divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);
                taxTotal = taxTotal.add(itemTax);
            }
        }

        order.setSubtotal(subtotal);
        order.setTaxAmount(taxTotal);

        // Apply coupon discount if provided
        BigDecimal couponDiscount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(request.getCouponCode().toUpperCase())
                    .orElseThrow(() -> new BadRequestException("Invalid coupon code"));
            if (!coupon.isValid()) throw new BadRequestException("Coupon expired or invalid");
            couponDiscount = coupon.calculateDiscount(subtotal);
            order.setCouponCode(coupon.getCode());
            order.setCouponDiscount(couponDiscount);
        }

        BigDecimal totalDiscount = order.getDiscountAmount().add(couponDiscount);
        BigDecimal totalAmount = subtotal.add(taxTotal).subtract(totalDiscount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;
        order.setTotalAmount(totalAmount);

        if (request.getAmountReceived() != null) {
            order.setAmountReceived(request.getAmountReceived());
            order.setChangeAmount(request.getAmountReceived().subtract(totalAmount));
        }

        order = orderRepository.save(order);

        // Update inventory for each item
        for (OrderItem item : order.getItems()) {
            inventoryService.logInventoryChange(
                    item.getProduct(), -item.getQuantity(),
                    InventoryReason.SALE, "ORDER", order.getId(),
                    "Sale - Order #" + order.getOrderNumber());
        }

        // Create payment record
        Payment payment = Payment.builder()
                .order(order).amount(totalAmount)
                .method(paymentMethod).status(PaymentStatus.COMPLETED).build();
        paymentRepository.save(payment);

        // Increment coupon usage
        if (order.getCouponCode() != null) {
            couponService.incrementUsage(order.getCouponCode());
        }

        // Update customer total purchases and loyalty points
        if (order.getCustomer() != null) {
            Customer customer = order.getCustomer();
            customer.setTotalPurchases(customer.getTotalPurchases().add(totalAmount));
            int points = totalAmount.intValue() / 10; // 1 point per $10
            customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
            customerRepository.save(customer);
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse processReturn(Long orderId, ReturnRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        BigDecimal refundAmount = BigDecimal.ZERO;

        for (ReturnRequest.ReturnItemRequest returnItem : request.getItems()) {
            OrderItem orderItem = order.getItems().stream()
                    .filter(i -> i.getId().equals(returnItem.getOrderItemId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "id", returnItem.getOrderItemId()));

            int maxReturnable = orderItem.getQuantity() - orderItem.getReturnedQuantity();
            if (returnItem.getQuantity() > maxReturnable) {
                throw new BadRequestException("Cannot return " + returnItem.getQuantity()
                        + " items. Maximum returnable: " + maxReturnable);
            }

            orderItem.setReturnedQuantity(orderItem.getReturnedQuantity() + returnItem.getQuantity());
            BigDecimal itemRefund = orderItem.getUnitPrice().multiply(BigDecimal.valueOf(returnItem.getQuantity()));
            refundAmount = refundAmount.add(itemRefund);

            inventoryService.logInventoryChange(
                    orderItem.getProduct(), returnItem.getQuantity(),
                    InventoryReason.RETURN, "ORDER", order.getId(),
                    "Return - " + (request.getReason() != null ? request.getReason() : "No reason"));
        }

        // Determine order status
        boolean allReturned = order.getItems().stream()
                .allMatch(i -> i.getReturnedQuantity().equals(i.getQuantity()));
        boolean anyReturned = order.getItems().stream()
                .anyMatch(i -> i.getReturnedQuantity() > 0);

        order.setStatus(allReturned ? OrderStatus.RETURNED : (anyReturned ? OrderStatus.PARTIALLY_RETURNED : order.getStatus()));

        Payment refund = Payment.builder()
                .order(order).amount(refundAmount.negate())
                .method(order.getPaymentMethod()).status(PaymentStatus.REFUNDED)
                .notes("Refund for return").build();
        paymentRepository.save(refund);

        order = orderRepository.save(order);
        return mapToResponse(order);
    }

    public PagedResponse<OrderResponse> getAllOrders(int page, int size, String search, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage;
        if (search != null && !search.trim().isEmpty()) {
            orderPage = orderRepository.searchOrders(search.trim(), pageable);
        } else if (status != null && !status.trim().isEmpty()) {
            orderPage = orderRepository.findByStatus(OrderStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            orderPage = orderRepository.findAll(pageable);
        }
        return PagedResponse.<OrderResponse>builder()
                .content(orderPage.getContent().stream().map(this::mapToResponse).toList())
                .page(orderPage.getNumber()).size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements()).totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast()).first(orderPage.isFirst()).build();
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return mapToResponse(order);
    }

    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return mapToResponse(order);
    }

    private String generateOrderNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long todayCount = orderRepository.count() + 1;
        String number;
        do {
            number = "ORD-" + datePart + "-" + (1000 + todayCount);
            todayCount++;
        } while (orderRepository.findByOrderNumber(number).isPresent());
        return number;
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(i -> OrderResponse.OrderItemResponse.builder()
                        .id(i.getId()).productId(i.getProduct().getId())
                        .productName(i.getProductName()).productSku(i.getProductSku())
                        .quantity(i.getQuantity()).unitPrice(i.getUnitPrice())
                        .costPrice(i.getCostPrice()).totalPrice(i.getTotalPrice())
                        .returnedQuantity(i.getReturnedQuantity()).build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId()).orderNumber(order.getOrderNumber())
                .customer(order.getCustomer() != null ? customerService.mapToResponse(order.getCustomer()) : null)
                .cashierName(order.getCashier().getFullName()).cashierId(order.getCashier().getId())
                .items(items).subtotal(order.getSubtotal()).taxAmount(order.getTaxAmount())
                .discountAmount(order.getDiscountAmount()).totalAmount(order.getTotalAmount())
                .couponCode(order.getCouponCode()).couponDiscount(order.getCouponDiscount())
                .paymentMethod(order.getPaymentMethod().name()).status(order.getStatus().name())
                .amountReceived(order.getAmountReceived()).changeAmount(order.getChangeAmount())
                .notes(order.getNotes()).createdAt(order.getCreatedAt()).build();
    }
}

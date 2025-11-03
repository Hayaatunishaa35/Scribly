package com.hayat.scribly.dto;

import com.hayat.scribly.entity.Address;
import com.hayat.scribly.entity.Customer;
import com.hayat.scribly.entity.Order;
import com.hayat.scribly.entity.OrderItem;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;
}

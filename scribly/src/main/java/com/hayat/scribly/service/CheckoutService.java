package com.hayat.scribly.service;

import com.hayat.scribly.dto.PaymentInfo;
import com.hayat.scribly.dto.Purchase;
import com.hayat.scribly.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;
}

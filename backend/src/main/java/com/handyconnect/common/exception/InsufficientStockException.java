package com.handyconnect.common.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String message) {
        super(message);
    }
    public InsufficientStockException(String itemSku, double requested, double available) {
        super(String.format("Insufficient available stock for SKU '%s'. Requested: %.2f, Available: %.2f", itemSku, requested, available));
    }
}

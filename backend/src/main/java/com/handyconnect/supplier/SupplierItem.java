package com.handyconnect.supplier;

import com.handyconnect.inventory.InventoryItem;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "supplier_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"supplier_id", "item_id"})
})
public class SupplierItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private InventoryItem item;

    @Column(name = "supplier_sku", length = 100)
    private String supplierSku;

    @Column(name = "wholesale_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal wholesalePrice;

    @Column(name = "standard_lead_time_days", nullable = false)
    private Integer standardLeadTimeDays = 3;

    @Column(name = "min_order_quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal minOrderQuantity = BigDecimal.ONE;

    public SupplierItem() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public InventoryItem getItem() {
        return item;
    }

    public void setItem(InventoryItem item) {
        this.item = item;
    }

    public String getSupplierSku() {
        return supplierSku;
    }

    public void setSupplierSku(String supplierSku) {
        this.supplierSku = supplierSku;
    }

    public BigDecimal getWholesalePrice() {
        return wholesalePrice;
    }

    public void setWholesalePrice(BigDecimal wholesalePrice) {
        this.wholesalePrice = wholesalePrice;
    }

    public Integer getStandardLeadTimeDays() {
        return standardLeadTimeDays;
    }

    public void setStandardLeadTimeDays(Integer standardLeadTimeDays) {
        this.standardLeadTimeDays = standardLeadTimeDays;
    }

    public BigDecimal getMinOrderQuantity() {
        return minOrderQuantity;
    }

    public void setMinOrderQuantity(BigDecimal minOrderQuantity) {
        this.minOrderQuantity = minOrderQuantity;
    }
}

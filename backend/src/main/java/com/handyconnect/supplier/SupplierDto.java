package com.handyconnect.supplier;

import java.math.BigDecimal;
import java.util.List;

public class SupplierDto {
    private Long id;
    private String code;
    private String companyName;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private Integer leadTimeDays;
    private Boolean isActive;
    private List<SupplierCatalogItemDto> catalog;

    public SupplierDto() {}

    public SupplierDto(Supplier s) {
        this.id = s.getId();
        this.code = s.getCode();
        this.companyName = s.getCompanyName();
        this.contactPerson = s.getContactPerson();
        this.email = s.getEmail();
        this.phone = s.getPhone();
        this.address = s.getAddress();
        this.leadTimeDays = s.getLeadTimeDays();
        this.isActive = s.getIsActive();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getLeadTimeDays() {
        return leadTimeDays;
    }

    public void setLeadTimeDays(Integer leadTimeDays) {
        this.leadTimeDays = leadTimeDays;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public List<SupplierCatalogItemDto> getCatalog() {
        return catalog;
    }

    public void setCatalog(List<SupplierCatalogItemDto> catalog) {
        this.catalog = catalog;
    }

    public static class SupplierCatalogItemDto {
        private Long id;
        private Long itemId;
        private String itemSku;
        private String itemName;
        private String supplierSku;
        private BigDecimal wholesalePrice;
        private Integer standardLeadTimeDays;
        private BigDecimal minOrderQuantity;

        public SupplierCatalogItemDto() {}

        public SupplierCatalogItemDto(SupplierItem si) {
            this.id = si.getId();
            if (si.getItem() != null) {
                this.itemId = si.getItem().getId();
                this.itemSku = si.getItem().getSku();
                this.itemName = si.getItem().getName();
            }
            this.supplierSku = si.getSupplierSku();
            this.wholesalePrice = si.getWholesalePrice();
            this.standardLeadTimeDays = si.getStandardLeadTimeDays();
            this.minOrderQuantity = si.getMinOrderQuantity();
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getItemId() {
            return itemId;
        }

        public void setItemId(Long itemId) {
            this.itemId = itemId;
        }

        public String getItemSku() {
            return itemSku;
        }

        public void setItemSku(String itemSku) {
            this.itemSku = itemSku;
        }

        public String getItemName() {
            return itemName;
        }

        public void setItemName(String itemName) {
            this.itemName = itemName;
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
}

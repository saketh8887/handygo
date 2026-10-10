package com.handyconnect.supplier;

import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.inventory.InventoryItem;
import com.handyconnect.inventory.InventoryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierItemRepository supplierItemRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public SupplierService(SupplierRepository supplierRepository,
                           SupplierItemRepository supplierItemRepository,
                           InventoryItemRepository inventoryItemRepository) {
        this.supplierRepository = supplierRepository;
        this.supplierItemRepository = supplierItemRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    @Transactional(readOnly = true)
    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToDtoWithCatalog)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return mapToDtoWithCatalog(supplier);
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierByEmail(String email) {
        Supplier supplier = supplierRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found for email: " + email));
        return mapToDtoWithCatalog(supplier);
    }

    @Transactional
    public SupplierDto createSupplier(SupplierDto dto) {
        Supplier supplier = new Supplier();
        supplier.setCode(dto.getCode());
        supplier.setCompanyName(dto.getCompanyName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setLeadTimeDays(dto.getLeadTimeDays() != null ? dto.getLeadTimeDays() : 3);
        supplier.setIsActive(true);

        return mapToDtoWithCatalog(supplierRepository.save(supplier));
    }

    @Transactional
    public void addCatalogItem(Long supplierId, SupplierDto.SupplierCatalogItemDto itemDto) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
        InventoryItem item = inventoryItemRepository.findById(itemDto.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemDto.getItemId()));

        SupplierItem si = supplierItemRepository.findBySupplierIdAndItemId(supplierId, itemDto.getItemId())
                .orElseGet(() -> {
                    SupplierItem newItem = new SupplierItem();
                    newItem.setSupplier(supplier);
                    newItem.setItem(item);
                    return newItem;
                });

        si.setSupplierSku(itemDto.getSupplierSku());
        si.setWholesalePrice(itemDto.getWholesalePrice());
        si.setStandardLeadTimeDays(itemDto.getStandardLeadTimeDays() != null ? itemDto.getStandardLeadTimeDays() : 3);
        si.setMinOrderQuantity(itemDto.getMinOrderQuantity());

        supplierItemRepository.save(si);
    }

    private SupplierDto mapToDtoWithCatalog(Supplier s) {
        SupplierDto dto = new SupplierDto(s);
        List<SupplierDto.SupplierCatalogItemDto> items = supplierItemRepository.findBySupplierId(s.getId()).stream()
                .map(SupplierDto.SupplierCatalogItemDto::new)
                .collect(Collectors.toList());
        dto.setCatalog(items);
        return dto;
    }
}

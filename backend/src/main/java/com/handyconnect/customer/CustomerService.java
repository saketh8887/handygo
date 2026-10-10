package com.handyconnect.customer;

import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerProfileRepository profileRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public CustomerService(CustomerProfileRepository profileRepository,
                           AddressRepository addressRepository,
                           UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CustomerDto getCustomerProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        CustomerProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> profileRepository.save(new CustomerProfile(user)));

        List<AddressDto> addresses = addressRepository.findByUserId(userId).stream()
                .map(AddressDto::new)
                .collect(Collectors.toList());

        CustomerDto dto = new CustomerDto();
        dto.setId(profile.getId());
        dto.setUserId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setPreferredContactMethod(profile.getPreferredContactMethod());
        dto.setNotes(profile.getNotes());
        dto.setAddresses(addresses);
        return dto;
    }

    @Transactional
    public CustomerDto updateCustomerProfile(Long userId, CustomerDto req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        userRepository.save(user);

        CustomerProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> new CustomerProfile(user));

        if (req.getPreferredContactMethod() != null) profile.setPreferredContactMethod(req.getPreferredContactMethod());
        if (req.getNotes() != null) profile.setNotes(req.getNotes());
        profileRepository.save(profile);

        return getCustomerProfile(userId);
    }

    @Transactional(readOnly = true)
    public List<AddressDto> getAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(AddressDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDto addAddress(Long userId, AddressDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Address address = new Address(
                user,
                dto.getLabel() != null ? dto.getLabel() : "Home",
                dto.getStreetLine(),
                dto.getCity(),
                dto.getState(),
                dto.getPostalCode(),
                dto.getLatitude() != null ? dto.getLatitude() : BigDecimal.ZERO,
                dto.getLongitude() != null ? dto.getLongitude() : BigDecimal.ZERO,
                dto.getIsDefault() != null ? dto.getIsDefault() : false
        );

        return new AddressDto(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        addressRepository.delete(address);
    }
}

package com.handyconnect.auth;

import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.customer.Address;
import com.handyconnect.customer.AddressRepository;
import com.handyconnect.customer.CustomerProfile;
import com.handyconnect.customer.CustomerProfileRepository;
import com.handyconnect.handyman.HandymanProfile;
import com.handyconnect.handyman.HandymanProfileRepository;
import com.handyconnect.security.JwtTokenProvider;
import com.handyconnect.security.SecurityUtils;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final HandymanProfileRepository handymanProfileRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       CustomerProfileRepository customerProfileRepository,
                       HandymanProfileRepository handymanProfileRepository,
                       AddressRepository addressRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.handymanProfileRepository = handymanProfileRepository;
        this.addressRepository = addressRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return new AuthResponse(jwt, new UserDto(user));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        String role = request.getRole() != null ? request.getRole() : "ROLE_CUSTOMER";
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role.toUpperCase();
        }

        // Only allow self-registration as CUSTOMER or HANDYMAN
        if (!role.equals("ROLE_CUSTOMER") && !role.equals("ROLE_HANDYMAN")) {
            role = "ROLE_CUSTOMER";
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhone(),
                role
        );
        user = userRepository.save(user);

        if ("ROLE_CUSTOMER".equals(role)) {
            CustomerProfile profile = new CustomerProfile(user);
            customerProfileRepository.save(profile);

            if (request.getStreetLine() != null && !request.getStreetLine().isBlank()) {
                Address address = new Address(
                        user,
                        "Home",
                        request.getStreetLine(),
                        request.getCity() != null ? request.getCity() : "Springfield",
                        request.getState() != null ? request.getState() : "State",
                        request.getPostalCode() != null ? request.getPostalCode() : "10001",
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        true
                );
                addressRepository.save(address);
            }
        } else if ("ROLE_HANDYMAN".equals(role)) {
            HandymanProfile profile = new HandymanProfile(user);
            if (request.getExperienceYears() != null) {
                profile.setExperienceYears(request.getExperienceYears());
            }
            if (request.getBio() != null) {
                profile.setBio(request.getBio());
            }
            if (request.getServiceAreas() != null) {
                profile.setServiceAreas(request.getServiceAreas());
            }
            if (request.getHourlyRate() != null) {
                profile.setHourlyRate(BigDecimal.valueOf(request.getHourlyRate()));
            }
            profile.setVerificationStatus("PENDING");
            handymanProfileRepository.save(profile);
        }

        String token = tokenProvider.generateTokenFromUser(user.getId(), user.getEmail(), user.getRole(), user.getFullName());
        return new AuthResponse(token, new UserDto(user));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BadRequestException("No authenticated user found");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found with id: " + userId));
        return new UserDto(user);
    }
}

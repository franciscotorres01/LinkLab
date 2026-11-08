package com.linklab.controller;

import com.linklab.dto.RegistroForm;
import com.linklab.model.Usuario;
import com.linklab.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class RegistroController {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;

    public RegistroController(UsuarioRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @GetMapping("/registro")
    public String mostrarFormulario(Model model) {
        model.addAttribute("form", new RegistroForm());
        return "registro";
    }

    @PostMapping("/registro")
    public String registrar(@Valid @ModelAttribute("form") RegistroForm form, BindingResult result) {
        if (form.getPassword() != null && !form.getPassword().equals(form.getConfirmPassword())) {
            result.rejectValue("confirmPassword", "mismatch", "Las contraseñas no coinciden");
        }
        if (form.getEmail() != null && repo.findByEmail(form.getEmail().trim()).isPresent()) {
            result.rejectValue("email", "duplicado", "Ya existe una cuenta con ese correo");
        }
        if (result.hasErrors()) {
            return "registro";
        }

        repo.save(new Usuario(form.getEmail().trim(), encoder.encode(form.getPassword()), "USER"));
        return "redirect:/login?registrado";
    }
}
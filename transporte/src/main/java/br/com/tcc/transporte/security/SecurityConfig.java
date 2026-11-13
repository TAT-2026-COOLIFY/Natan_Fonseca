package br.com.tcc.transporte.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Vem da variavel de ambiente APP_FRONTEND_URL (Coolify).
    // Pode ter mais de uma URL separada por virgula.
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/agendamentos/{id}").authenticated()
                        .requestMatchers(HttpMethod.GET, "/agendamentos/{id}/passageiros").authenticated()
                        .requestMatchers(HttpMethod.GET, "/agendamentos/{id}/vagas").authenticated()
                        .requestMatchers(HttpMethod.GET, "/agendamentos/{id}/relatorio").authenticated()
                        .requestMatchers(HttpMethod.GET, "/agendamentos/motorista/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/agendamentos/{id}/iniciar").authenticated()
                        .requestMatchers(HttpMethod.POST, "/agendamentos/{id}/finalizar").hasAuthority("MOTORISTA")

                        .requestMatchers("/agendamentos/**").hasAuthority("FUNCIONARIO")
                        .requestMatchers("/pacientes/**").hasAuthority("FUNCIONARIO")
                        .requestMatchers("/veiculos/**").hasAuthority("FUNCIONARIO")
                        .requestMatchers("/cidades/**").hasAuthority("FUNCIONARIO")
                        .requestMatchers("/consultas/**").hasAuthority("FUNCIONARIO")
                        .requestMatchers("/exames/**").hasAuthority("FUNCIONARIO")
                        .requestMatchers("/usuarios/**").hasAuthority("FUNCIONARIO")
                        .requestMatchers("/rotas/**").hasAuthority("FUNCIONARIO")

                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) ->
                                escreverErroJson(response, HttpStatus.UNAUTHORIZED,
                                        "É necessário fazer login para acessar este recurso."))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                escreverErroJson(response, HttpStatus.FORBIDDEN,
                                        "Seu perfil não tem permissão para esta ação."))
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    private void escreverErroJson(
            HttpServletResponse response,
            HttpStatus status,
            String mensagem
    ) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(Map.of("erro", mensagem)));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        // Sempre libera o frontend local (desenvolvimento)
        List<String> origensPermitidas = new ArrayList<>();
        origensPermitidas.add("http://localhost:5173");

        // Libera tambem as URLs que vierem do APP_FRONTEND_URL
        for (String url : frontendUrl.split(",")) {
            String origem = url.trim();
            if (origem.endsWith("/")) {
                origem = origem.substring(0, origem.length() - 1);
            }
            if (!origem.isEmpty() && !origensPermitidas.contains(origem)) {
                origensPermitidas.add(origem);
            }
        }

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(origensPermitidas);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}

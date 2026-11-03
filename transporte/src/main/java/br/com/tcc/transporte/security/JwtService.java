package br.com.tcc.transporte.security;

import br.com.tcc.transporte.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

// gera e valida o token JWT do login (guarda o id e o perfil do usuario)
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private Key chaveDeAssinatura() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String gerarToken(Usuario usuario) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(String.valueOf(usuario.getId()))
                .claim("perfil", usuario.getPerfil().name())
                .claim("nome", usuario.getNome())
                .setIssuedAt(agora)
                .setExpiration(expiracao)
                .signWith(chaveDeAssinatura(), SignatureAlgorithm.HS256)
                .compact();
    }

    // se o token for invalido/expirado, estoura JwtException
    public Claims validarToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(chaveDeAssinatura())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

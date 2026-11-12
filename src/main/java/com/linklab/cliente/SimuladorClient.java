package com.linklab.cliente;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class SimuladorClient {

    private final RestTemplate rest;
    private final String baseUrl;

    public SimuladorClient(@Value("${simulador.url}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(30000);
        this.rest = new RestTemplate(factory);
        this.baseUrl = baseUrl;
    }

    public Map<String, Object> simular(Map<String, Object> params) {
        return rest.exchange(
                baseUrl + "/simular",
                HttpMethod.POST,
                new HttpEntity<>(params),
                new ParameterizedTypeReference<Map<String, Object>>() {}
        ).getBody();
    }
}
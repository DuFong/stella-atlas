package com.stellaatlas.weather.infrastructure;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableCaching
@EnableConfigurationProperties({
        OpenMeteoProperties.class,
        WeatherCacheProperties.class
})
class WeatherInfrastructureConfiguration {

    @Bean
    @Qualifier("openMeteoRestClient")
    RestClient openMeteoRestClient(OpenMeteoProperties properties) {
        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.connectTimeout());
        requestFactory.setReadTimeout(properties.readTimeout());

        return RestClient.builder()
                .baseUrl(properties.baseUrl().toString())
                .requestFactory(requestFactory)
                .build();
    }

    @Bean
    CacheManager weatherCacheManager(WeatherCacheProperties properties) {
        CaffeineCacheManager cacheManager =
                new CaffeineCacheManager("weatherForecasts");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(properties.maximumSize())
                .expireAfterWrite(properties.ttl()));
        return cacheManager;
    }
}

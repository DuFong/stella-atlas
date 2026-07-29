package com.stellaatlas.location.infrastructure;

import net.iakovlev.timeshape.TimeZoneEngine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class TimeZoneInfrastructureConfiguration {

    @Bean
    TimeZoneEngine timeZoneEngine() {
        return TimeZoneEngine.initialize();
    }
}

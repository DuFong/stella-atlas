package com.stellaatlas.observation.application;

import com.stellaatlas.observation.domain.BestObservationWindowSelector;
import com.stellaatlas.observation.domain.DefaultObservationScorePolicy;
import com.stellaatlas.observation.domain.ObservationScorePolicy;
import com.stellaatlas.observation.domain.rule.CloudCoverRule;
import com.stellaatlas.observation.domain.rule.HumidityRule;
import com.stellaatlas.observation.domain.rule.MoonlightRule;
import com.stellaatlas.observation.domain.rule.PrecipitationRule;
import com.stellaatlas.observation.domain.rule.TwilightRule;
import com.stellaatlas.observation.domain.rule.VisibilityRule;
import com.stellaatlas.observation.domain.rule.WindRule;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class ObservationConfiguration {

    @Bean
    ObservationScorePolicy observationScorePolicy() {
        return new DefaultObservationScorePolicy(List.of(
                new CloudCoverRule(),
                new PrecipitationRule(),
                new VisibilityRule(),
                new HumidityRule(),
                new WindRule(),
                new MoonlightRule(),
                new TwilightRule()
        ));
    }

    @Bean
    BestObservationWindowSelector bestObservationWindowSelector() {
        return new BestObservationWindowSelector();
    }

    @Bean
    TwilightPhaseResolver twilightPhaseResolver() {
        return new TwilightPhaseResolver();
    }

    @Bean
    MoonPresenceResolver moonPresenceResolver() {
        return new MoonPresenceResolver();
    }
}

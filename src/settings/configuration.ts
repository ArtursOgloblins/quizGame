import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

enum Environments {
    DEVELOPMENT = 'DEVELOPMENT',
    STAGING = 'STAGING',
    PRODUCTION = 'PRODUCTION',
    TEST = 'TEST',
}

export type EnvironmentVariable = { [key: string]: string | undefined };

export type ConfigurationType = ReturnType<typeof getConfig>;

const getConfig = (
    environmentVariables: EnvironmentVariable,
    currentEnvironment: Environments,
) => {
    let databaseUrl: string;
    switch (currentEnvironment) {
        case Environments.TEST:
            databaseUrl = environmentVariables.DATABASE_URL_TEST!;
            break;
        case Environments.PRODUCTION:
            databaseUrl = environmentVariables.DATABASE_URL!;
            break;
        case Environments.STAGING:
            databaseUrl = environmentVariables.DATABASE_URL_STAGING!;
            break;
        case Environments.DEVELOPMENT:
        default:
            databaseUrl = environmentVariables.DATABASE_URL!;
            break;
    }

    return {
        apiSettings: {
            PORT: Number.parseInt(environmentVariables.PORT || '3000'),
            LOCAL_HOST: environmentVariables.LOCAL_HOST || 'http://localhost:3000',
        },

        database: {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: false,
            logging: ['query'],
        } as Partial<TypeOrmModuleAsyncOptions>,

        environmentSettings: {
            currentEnv: currentEnvironment,
            isProduction: currentEnvironment === Environments.PRODUCTION,
            isStaging: currentEnvironment === Environments.STAGING,
            isTesting: currentEnvironment === Environments.TEST,
            isDevelopment: currentEnvironment === Environments.DEVELOPMENT,
        },

        jwtSettings: {
            jwtSecret: environmentVariables.JWT_SECRET,
            jwtRefreshSecret: environmentVariables.JWT_REFRESH_SECRET,
            accessTokenExpirationTime:
                environmentVariables.ACCESS_TOKEN_EXPIRATION_TIME!.toString() || `10s`,
            refreshTokenExpirationTime:
                environmentVariables.REFRESH_TOKEN_EXPIRATION_TIME!.toString() || `20s`,
            refreshTokenCookieMaxAge: 7 * 24 * 60 * 60 * 1000,
        },

        rateLimitSettings: {
            limit: environmentVariables.RATE_LIMIT || 5,
            ttl: environmentVariables.RATE_LIMIT_TTL || 10000,
        },
    };
};

export default () => {
    const environmentVariables = process.env;

    console.log('process.env.ENV =', environmentVariables.ENV);
    const currentEnvironment: Environments =
        environmentVariables.ENV as Environments;

    return getConfig(environmentVariables, currentEnvironment);
};

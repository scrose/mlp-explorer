
import fetch from 'node-fetch';

/**
 * Make request to API.
 *
 * @public
 * @param url
 * @param payload
 */

export const post = async (url, payload) =>  {

    const encodedBody = Object.keys(payload)
        .map(key => {
            const encodedKey = encodeURIComponent(key);
            const encodedValue = encodeURIComponent(payload[key]);
            return `${encodedKey}=${encodedValue}`;
        })
        .join("&");

    // compose request headers/options
    const opts = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: encodedBody
    };

    // send request to API
    let res = fetch(url, opts)
        .catch(err => {
            console.error(err)
            throw err
        });
    await res.json();


    console.log('\n\nFetch response:\n\n', res, res.headers)

    // Modify response to include status ok, success, and status text
    return {
        success: res.ok,
        status: res.status,
        statusText: res.statusText,
        data: res
    }
}

/**
 * Refresh access token.
 *
 * @param {Object} credentials
 * @public
 */

export const refresh = async (credentials) => {

    // KeyCloak settings
    const settings = {
        clientId: "nodejs-microservice",
        realm: "MLP-Explorer",
        serverURL: "http://localhost:8080/auth",
        ssl: "external",
        resource: "nodejs-microservice",
        bearerOnly: true,
        credentials: {
            secret: "6d979be5-cb81-4d5c-9fc7-45d1b0c7a75e"
        }
    }
    // construct request url
    const baseUrl = settings.serverURL;
    const realmName = settings.realm;
    const url = `${baseUrl}/realms/${realmName}/protocol/openid-connect/token`;

    // Prepare credentials for openid-connect token request
    // ref: http://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
    const payload = {
        grant_type: credentials.grantType,
        username: credentials.username,
        password: credentials.password,
        client_secret: credentials.client_secret,
        client_id: credentials.clientId,
        totp: credentials.totp
        // ...(credentials.offlineToken ? {scope: 'offline_access'} : {}),
        // ...(credentials.refreshToken ? {
        //     refresh_token: credentials.refreshToken,
        //     client_secret: credentials.clientSecret,
        // } : {}),
    };

// // Periodically using refresh_token grant flow to get new access token here
//     setInterval(async () => {
//         const refreshToken = tokenSet.refresh_token;
//         tokenSet = await client.refresh(refreshToken);
//         kcAdminClient.setAccessToken(tokenSet.access_token);
//     }, 58 * 1000); // 58 seconds

        if (credentials.clientSecret) {
            config.auth = {
                username: credentials.clientId,
                password: credentials.clientSecret,
            };
        }

        // request access token
        return await post(url, payload);
}
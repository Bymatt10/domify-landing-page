import { text } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth2 Redirect</title>
</head>
<body>
    <script>
        'use strict';
        function run () {
            var oauth2RedirectUri = location.origin + location.pathname;
            var sentState = location.search.match(/state=([^&]*)/);
            var state = sentState ? sentState[1] : null;
            var code = location.search.match(/code=([^&]*)/);
            var error = location.search.match(/error=([^&]*)/);
            
            if (code) {
                window.opener.swaggerUIRedirectOauth2({
                    auth: {
                        code: code[1],
                        state: state
                    },
                    redirectUri: oauth2RedirectUri
                });
            } else if (error) {
                window.opener.swaggerUIRedirectOauth2({
                    error: error[1],
                    error_description: location.search.match(/error_description=([^&]*)/) ? location.search.match(/error_description=([^&]*)/)[1] : null,
                    state: state,
                    redirectUri: oauth2RedirectUri
                });
            } else {
                window.opener.swaggerUIRedirectOauth2({
                    error: "access_denied",
                    error_description: "No authorization code or error received",
                    state: state,
                    redirectUri: oauth2RedirectUri
                });
            }
            window.close();
        }
        
        if (document.readyState !== "loading") {
            run();
        } else {
            document.addEventListener("DOMContentLoaded", function () {
                run();
            });
        }
    </script>
</body>
</html>`;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html'
        }
    });
}; 
<#-- Plantilla de login de LinkLab: reemplaza la de keycloak.v2 con un diseño de dos paneles -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Iniciar sesión | LinkLab</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${url.resourcesPath}/css/linklab-login.css">
</head>
<body>
<div class="ll-shell">

    <aside class="ll-brand">
        <div class="ll-logo">
            <span class="ll-logo__mark">&gt;_</span>
            <span>LinkLab</span>
        </div>

        <div class="ll-hero">
            <span class="ll-eyebrow">Simulador de enlace</span>
            <h1>Modela la pérdida de paquetes con precisión.</h1>
            <p>Analiza el comportamiento estadístico de tu enlace y compara escenarios en un solo lugar.</p>
        </div>

        <div class="ll-copy">&copy; LinkLab</div>
    </aside>

    <main class="ll-main">
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <a class="ll-register" href="${url.registrationUrl}">Registrarse</a>
        </#if>

        <section class="ll-card">
            <h2>Iniciar sesión</h2>
            <p class="ll-sub">Ingresa a tu laboratorio.</p>

            <#if messagesPerField.existsError('username','password')>
                <div class="ll-alert ll-alert--error" role="alert">${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</div>
            <#elseif message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                <div class="ll-alert ll-alert--${message.type}" role="alert">${kcSanitize(message.summary)?no_esc}</div>
            </#if>

            <#if realm.password>
                <form id="kc-form-login" action="${url.loginAction}" method="post" onsubmit="document.getElementById('kc-login').disabled = true; return true;">

                    <div class="ll-field<#if messagesPerField.existsError('username','password')> ll-field--error</#if>">
                        <label for="username">Correo</label>
                        <input id="username" name="username" type="text" value="${(login.username!'')}" placeholder="tu@correo.com" autocomplete="username" autofocus>
                    </div>

                    <div class="ll-field<#if messagesPerField.existsError('username','password')> ll-field--error</#if>">
                        <label for="password">Contraseña</label>
                        <input id="password" name="password" type="password" placeholder="••••••••" autocomplete="current-password">
                    </div>

                    <#if realm.rememberMe && !usernameHidden??>
                        <label class="ll-remember">
                            <input type="checkbox" id="rememberMe" name="rememberMe" <#if login.rememberMe??>checked</#if>>
                            Recordarme
                        </label>
                    </#if>

                    <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>>

                    <button class="ll-submit" id="kc-login" name="login" type="submit">Entrar</button>

                    <#if realm.resetPasswordAllowed>
                        <div class="ll-links">
                            <a href="${url.loginResetCredentialsUrl}">¿Olvidaste tu contraseña?</a>
                        </div>
                    </#if>
                </form>
            </#if>
        </section>
    </main>

</div>
</body>
</html>
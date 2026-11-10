<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Crear cuenta | LinkLab</title>
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
        <a class="ll-register" href="${url.loginUrl}">Iniciar sesión</a>

        <section class="ll-card">
            <h2>Crear cuenta</h2>
            <p class="ll-sub">Regístrate para acceder a tu laboratorio.</p>

            <#if message?has_content && message.type != 'warning'>
                <div class="ll-alert ll-alert--${message.type}" role="alert">${kcSanitize(message.summary)?no_esc}</div>
            </#if>

            <form id="kc-register-form" action="${url.registrationAction}" method="post">

                <div class="ll-row">
                    <div class="ll-field<#if messagesPerField.existsError('firstName')> ll-field--error</#if>">
                        <label for="firstName">Nombre</label>
                        <input id="firstName" name="firstName" type="text" value="${(register.formData.firstName!'')}" placeholder="Tu nombre" autocomplete="given-name">
                        <#if messagesPerField.existsError('firstName')>
                            <span class="ll-error">${kcSanitize(messagesPerField.getFirstError('firstName'))?no_esc}</span>
                        </#if>
                    </div>

                    <div class="ll-field<#if messagesPerField.existsError('lastName')> ll-field--error</#if>">
                        <label for="lastName">Apellido</label>
                        <input id="lastName" name="lastName" type="text" value="${(register.formData.lastName!'')}" placeholder="Tu apellido" autocomplete="family-name">
                        <#if messagesPerField.existsError('lastName')>
                            <span class="ll-error">${kcSanitize(messagesPerField.getFirstError('lastName'))?no_esc}</span>
                        </#if>
                    </div>
                </div>

                <div class="ll-field<#if messagesPerField.existsError('email')> ll-field--error</#if>">
                    <label for="email">Correo</label>
                    <input id="email" name="email" type="text" value="${(register.formData.email!'')}" placeholder="tu@correo.com" autocomplete="email">
                    <#if messagesPerField.existsError('email')>
                        <span class="ll-error">${kcSanitize(messagesPerField.getFirstError('email'))?no_esc}</span>
                    </#if>
                </div>

                <#if !realm.registrationEmailAsUsername>
                    <div class="ll-field<#if messagesPerField.existsError('username')> ll-field--error</#if>">
                        <label for="username">Usuario</label>
                        <input id="username" name="username" type="text" value="${(register.formData.username!'')}" placeholder="Elige un usuario" autocomplete="username">
                        <#if messagesPerField.existsError('username')>
                            <span class="ll-error">${kcSanitize(messagesPerField.getFirstError('username'))?no_esc}</span>
                        </#if>
                    </div>
                </#if>

                <#if passwordRequired??>
                    <div class="ll-field<#if messagesPerField.existsError('password','password-confirm')> ll-field--error</#if>">
                        <label for="password">Contraseña</label>
                        <input id="password" name="password" type="password" placeholder="••••••••" autocomplete="new-password">
                        <#if messagesPerField.existsError('password')>
                            <span class="ll-error">${kcSanitize(messagesPerField.getFirstError('password'))?no_esc}</span>
                        </#if>
                    </div>

                    <div class="ll-field<#if messagesPerField.existsError('password-confirm')> ll-field--error</#if>">
                        <label for="password-confirm">Confirmar contraseña</label>
                        <input id="password-confirm" name="password-confirm" type="password" placeholder="••••••••" autocomplete="new-password">
                        <#if messagesPerField.existsError('password-confirm')>
                            <span class="ll-error">${kcSanitize(messagesPerField.getFirstError('password-confirm'))?no_esc}</span>
                        </#if>
                    </div>
                </#if>

                <button class="ll-submit" type="submit">Crear cuenta</button>

                <div class="ll-links">
                    ¿Ya tienes cuenta? <a href="${url.loginUrl}">Inicia sesión</a>
                </div>
            </form>
        </section>
    </main>

</div>
</body>
</html>
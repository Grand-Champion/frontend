<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { language, translations } from "$lib/stores/language";

    $: status = $page.status;
    $: message = $page.error?.message || "An unexpected error occurred";
    $: errorDetails = getErrorDetails(status, message);
    $: lang = $language;
    $: t = translations[lang] as Record<string, string>;

    let showDetails = false;
    let consoleLogs: string[] = [];

    onMount(() => {
        // Initialize consoleLogs with error info from page context
        if ($page.error) {
            const errorInfo = `Error: ${$page.error.message || "Unknown error"}`;
            consoleLogs = [errorInfo];
            if ($page.error.stack) {
                consoleLogs.push("Stack trace available in details section");
            }
        }

        // Capture future console logs
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        const captureLog = (level: string, ...args: any[]) => {
            const logMessage = args
                .map((arg) => {
                    if (typeof arg === "object") {
                        return JSON.stringify(arg, null, 2);
                    }
                    return String(arg);
                })
                .join(" ");
            consoleLogs = [...consoleLogs, `[${level}] ${logMessage}`];
        };

        console.log = (...args) => {
            originalLog(...args);
            captureLog("LOG", ...args);
        };

        console.error = (...args) => {
            originalError(...args);
            captureLog("ERROR", ...args);
        };

        console.warn = (...args) => {
            originalWarn(...args);
            captureLog("WARN", ...args);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    });

    function goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            goto("/");
        }
    }

    function getErrorDetails(status: number, message: string) {
        const details: any = {
            timestamp: new Date().toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            }),
            status,
            message,
            type: "Unknown Error",
            possibleCauses: [],
            suggestions: [],
        };

        // Categorize error based on status code and message
        if (status === 404) {
            details.type = "Page Not Found";
            details.possibleCauses = [
                "The URL may have been mistyped",
                "The page may have been moved or deleted",
                "The link you followed may be outdated",
            ];
            details.suggestions = [
                "Check the URL for typos",
                "Use the navigation menu to find what you're looking for",
                "Return to the home page",
            ];
        } else if (status === 500) {
            details.type = "Internal Server Error";
            details.possibleCauses = [
                "Database connection failure",
                "Server configuration issue",
                "Unexpected application error",
            ];
            details.suggestions = [
                "Try refreshing the page",
                "Wait a few minutes and try again",
                "Contact support if the problem persists",
            ];
        } else if (status === 503) {
            details.type = "Service Unavailable";
            details.possibleCauses = [
                "Server is temporarily down for maintenance",
                "Server is overloaded",
                "Database service is unavailable",
            ];
            details.suggestions = [
                "Wait a few minutes and try again",
                "Check service status page",
            ];
        } else if (status === 403) {
            details.type = "Forbidden";
            details.possibleCauses = [
                "You don't have permission to access this resource",
                "Authentication token may have expired",
            ];
            details.suggestions = [
                "Log in again",
                "Contact an administrator for access",
            ];
        } else if (status === 401) {
            details.type = "Unauthorized";
            details.possibleCauses = [
                "You need to be logged in to access this page",
                "Your session may have expired",
            ];
            details.suggestions = [
                "Log in to continue",
                "Check your credentials",
            ];
        } else if (status >= 500) {
            details.type = "Server Error";
            details.possibleCauses = [
                "Backend service error",
                "Database connection issue",
                "Server misconfiguration",
            ];
            details.suggestions = [
                "Try again later",
                "Contact support if the issue persists",
            ];
        } else if (status >= 400) {
            details.type = "Client Error";
            details.possibleCauses = [
                "Invalid request",
                "Missing required information",
            ];
            details.suggestions = ["Go back and try again", "Check your input"];
        }

        // Check for specific error messages
        if (
            message.toLowerCase().includes("fetch") ||
            message.toLowerCase().includes("network")
        ) {
            details.type = "Network Error";
            details.possibleCauses = [
                "No internet connection",
                "Server is unreachable",
                "Network timeout",
            ];
            details.suggestions = [
                "Check your internet connection",
                "Try again in a few moments",
                "Disable VPN if you're using one",
            ];
        } else if (
            message.toLowerCase().includes("database") ||
            message.toLowerCase().includes("db")
        ) {
            details.type = "Database Error";
            details.possibleCauses = [
                "Database connection failed",
                "Database query error",
                "Database is temporarily unavailable",
            ];
            details.suggestions = [
                "Refresh the page",
                "Contact support if the problem persists",
            ];
        }

        return details;
    }

    function toggleDetails() {
        showDetails = !showDetails;
    }
</script>

<div class="error-container">
    <div class="error-content" class:expanded={showDetails}>
        <div class="error-main">
            <h1 class="error-code">{status}</h1>
            <h2 class="error-title">
                {#if status === 404}
                    {t.pageNotFound}
                {:else if status === 500}
                    {t.internalServerError}
                {:else}
                    {t.error}
                {/if}
            </h2>
            <p class="error-message">{message}</p>

            <div class="button-group">
                <button class="back-button" on:click={goBack}>
                    ← {t.goBack}
                </button>
                <button class="details-button" on:click={toggleDetails}>
                    {showDetails ? t.hideDetails : t.showDetails}
                </button>
            </div>
        </div>

        {#if showDetails}
            <div class="divider"></div>
            <div class="error-details">
                <div class="detail-section">
                    <h3 class="detail-title">{t.errorType}</h3>
                    <p class="detail-text">{errorDetails.type}</p>
                </div>

                {#if errorDetails.possibleCauses.length > 0}
                    <div class="detail-section">
                        <h3 class="detail-title">{t.possibleCauses}</h3>
                        <ul class="detail-list">
                            {#each errorDetails.possibleCauses as cause}
                                <li>{cause}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}

                {#if errorDetails.suggestions.length > 0}
                    <div class="detail-section">
                        <h3 class="detail-title">{t.suggestions}</h3>
                        <ul class="detail-list">
                            {#each errorDetails.suggestions as suggestion}
                                <li>{suggestion}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}

                <div class="detail-section">
                    <h3 class="detail-title">{t.timestamp}</h3>
                    <p class="detail-text mono">{errorDetails.timestamp}</p>
                </div>

                {#if consoleLogs.length > 0}
                    <div class="detail-section">
                        <h3 class="detail-title">{t.consoleOutput}</h3>
                        <pre class="stack-trace">{consoleLogs.join("\n")}</pre>
                    </div>
                {/if}

                {#if $page.error?.stack}
                    <div class="detail-section">
                        <h3 class="detail-title">{t.stackTrace}</h3>
                        <pre class="stack-trace">{$page.error.stack}</pre>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .error-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        background: var(--background);
        overflow: hidden;
    }

    .error-content {
        display: flex;
        background: var(--card);
        color: var(--card-foreground);
        width: 600px;
        height: 65vh;
        max-width: 90vw;
        border-radius: var(--radius);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--border);
        overflow: hidden;
        transition: width 0.4s ease;
    }

    .error-content.expanded {
        width: 1100px;
        max-width: 90vw;
    }

    .error-main {
        padding: 3rem 2rem;
        text-align: center;
        flex-shrink: 0;
        width: 600px;
    }

    .divider {
        width: 1px;
        background: var(--border);
        flex-shrink: 0;
        animation: slideIn 0.3s ease;
    }

    .error-code {
        font-size: 8rem;
        font-weight: bold;
        margin: 0;
        line-height: 1;
        color: var(--primary);
    }

    .error-title {
        font-size: 2rem;
        font-weight: 600;
        margin: 1rem 0;
        color: var(--foreground);
    }

    .error-message {
        font-size: 1.125rem;
        margin: 1.5rem 0 2rem;
        color: var(--muted-foreground);
    }

    .button-group {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .back-button,
    .details-button {
        background: var(--primary);
        color: var(--primary-foreground);
        border: none;
        padding: 0.875rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        border-radius: var(--radius);
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .details-button {
        background: var(--muted);
        color: var(--muted-foreground);
    }

    .back-button:hover,
    .details-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        opacity: 0.9;
    }

    .back-button:active,
    .details-button:active {
        transform: translateY(0);
    }

    .error-details {
        padding: 3rem 2rem;
        text-align: left;
        animation: slideIn 0.3s ease;
        width: 500px;
        flex-shrink: 0;
        overflow-y: auto;
        height: 100%;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .detail-section {
        margin-bottom: 1.5rem;
    }

    .detail-title {
        font-size: 0.875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--primary);
        margin-bottom: 0.5rem;
    }

    .detail-text {
        font-size: 1rem;
        color: var(--foreground);
        margin: 0;
    }

    .detail-text.mono {
        font-family: "Courier New", monospace;
        font-size: 0.875rem;
        color: var(--muted-foreground);
    }

    .detail-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .detail-list li {
        padding: 0.5rem 0;
        padding-left: 1.5rem;
        position: relative;
        color: var(--foreground);
        font-size: 0.95rem;
    }

    .detail-list li::before {
        content: "•";
        position: absolute;
        left: 0.5rem;
        color: var(--primary);
        font-weight: bold;
    }

    .stack-trace {
        background: var(--muted);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 1rem;
        overflow-x: auto;
        font-family: "Courier New", monospace;
        font-size: 0.75rem;
        color: var(--muted-foreground);
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 300px;
        overflow-y: auto;
    }

    @media (max-width: 1024px) {
        .error-content {
            flex-direction: column;
            max-width: 600px !important;
        }

        .error-main {
            min-width: auto;
            width: 100%;
        }

        .divider {
            width: 100%;
            height: 1px;
        }

        .error-details {
            min-width: auto;
            width: 100%;
            max-height: none;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    }

    @media (max-width: 640px) {
        .error-container {
            padding: 1rem;
        }

        .error-main {
            padding: 2rem 1.5rem;
        }

        .error-details {
            padding: 2rem 1.5rem;
        }

        .error-code {
            font-size: 5rem;
        }

        .error-title {
            font-size: 1.5rem;
        }

        .error-message {
            font-size: 1rem;
        }

        .button-group {
            flex-direction: column;
            gap: 0.75rem;
        }

        .back-button,
        .details-button {
            width: 100%;
        }

        .detail-list li {
            font-size: 0.875rem;
        }
    }
</style>

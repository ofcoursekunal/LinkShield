(function() {

    function isNative(fn) {
        return typeof fn === "function" &&
               fn.toString().includes("[native code]");
    }

    let findings = [];

    if (!isNative(console.log))
        findings.push("console.log() hooked");

    if (!isNative(eval))
        findings.push("eval() modified");

    if (!isNative(Function))
        findings.push("Function constructor modified");

    if (!isNative(setTimeout))
        findings.push("setTimeout() modified");

    window.postMessage({
        type: "SMART_SHIELD_CONSOLE_RESULT",
        findings: findings
    }, "*");

})();
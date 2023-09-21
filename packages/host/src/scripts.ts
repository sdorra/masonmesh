export function loadScript(src: string) {
	const script = document.createElement("script");
	script.async = true;
	script.src = src;
	document.body.appendChild(script);
	document.body.removeChild(script);
}

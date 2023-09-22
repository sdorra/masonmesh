export function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.async = true;
		script.src = src;
		script.onload = () => resolve();
		script.onerror = () => reject(`Failed to load script ${src}`);
		document.body.appendChild(script);
		document.body.removeChild(script);
	});
}

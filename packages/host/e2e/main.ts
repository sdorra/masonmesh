const app = document.querySelector("#app");
if (!app) {
	throw new Error("No app element");
}

app.innerHTML = "Loading...";

const searchParams = new URLSearchParams(window.location.search);
const test = searchParams.get("test");
if (test) {
	import(`./test-${test}.ts`)
		.then((result) => {
			app.classList.remove("error");
			app.classList.add("success");
			app.innerHTML = result.default;
		})
		.catch((err) => {
			app.classList.remove("success");
			app.classList.add("error");
			app.innerHTML = `Error: ${err}`;
		});
} else {
	app.innerHTML = "No test specified";
}

const SCRIPT = `(function(){try{var t=localStorage.getItem("tema");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export default function TemaScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}

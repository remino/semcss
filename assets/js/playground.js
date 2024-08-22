import init from '@remino/reslib/lib/init.js'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { html } from '@codemirror/lang-html'
import { dracula } from 'thememirror'

class PlaygroundApp extends HTMLElement {
	connectedCallback() {
		const doc = this.innerHTML

		this.innerHTML = `
			<nav>
				<menu>
					<li><a href="#editor">Editor</a></li>
					<li><a href="#semcss">With sem.css</a></li>
					<li><a href="#nostyle">Without Stylesheet</a></li>
				</menu>
			</nav>
			<form>
				<fieldset id="editor"><legend>HTML Editor</legend><div></div></fieldset>
				<fieldset id="semcss"><legend>With <mark><strong>sem.css</strong></mark></legend><output><iframe></iframe></output></fieldset>
				<fieldset id="nostyle"><legend>Without Stylesheet</legend><output><iframe></iframe></output></fieldset>
			</form>
		`

		const iframes = this.querySelectorAll('iframe')

		iframes[0].srcdoc = `
			<!DOCTYPE html>
			<html>
			<title>With sem.css</title>
			<link rel="stylesheet" href="/semcss/sem.css">
			<body>${doc}</body>
		`

		iframes[1].srcdoc = `
			<!DOCTYPE html>
			<html>
			<title>With no stylesheet</title>
			<body>${doc}</body>
		`

		this.querySelector('form').addEventListener('submit', event => {
			event.preventDefault()
			event.stopPropagation()
		})

		this.state = EditorState.create({
			doc,
			extensions: [
				basicSetup,
				dracula,
				html(),
				EditorView.updateListener.of(this.updateOutput.bind(this)),
			],
		})

		this.editor = new EditorView({
			parent: this.querySelector('div'),
			state: this.state,
		})

		this.editor.requestMeasure()
	}

	updateOutput() {
		const htmlSrc = this.editor.state.doc.toString()
		const iframes = this.querySelectorAll('iframe')

		iframes.forEach(iframe => {
			iframe.contentDocument.body.innerHTML = htmlSrc || ''
			iframe.style.setProperty('height', 'auto')
			iframe.style.setProperty('height', `${iframe.contentDocument.documentElement.scrollHeight}px`)
		})
	}
}

const resizeEditor = () => {
	// Resize editor using JavaScript because CodeMirror 6 is stubborn,
	// unlike a normal <textarea>.
	const editor = document.querySelector('playground-app fieldset#editor > div')
	const frame = document.querySelector('playground-app iframe')
	const { width } = window.getComputedStyle(frame)
	editor.style.setProperty('width', width)
}

const startApp = () => {
	customElements.define('playground-app', PlaygroundApp)

	window.addEventListener('resize', resizeEditor)
	resizeEditor()
}

init({
	parallel: [
		startApp,
	],
})
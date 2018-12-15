/*! terminal.js v2.0 | (c) 2014 Erik Österberg | https://github.com/eosterberg/terminaljs

The MIT License (MIT)

Original work Copyright (c) 2014 Erik Österberg
Modifications Copywrite (c) 2018 Tyler Grunenwald

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var Terminal = (function () {
	// PROMPT_TYPE
	var PROMPT_INPUT = 1, PROMPT_PASSWORD = 2, PROMPT_CONFIRM = 3

	var fireCursorInterval = function (inputField, terminalObj) {
		var cursor = terminalObj._cursor
		setTimeout(function () {
			if (inputField.parentElement && terminalObj._shouldBlinkCursor) {
				cursor.style.visibility = cursor.style.visibility === 'visible' ? 'hidden' : 'visible'
				fireCursorInterval(inputField, terminalObj)
			} else {
				cursor.style.visibility = 'visible'
			}
		}, 500)
	}

	var firstPrompt = true;
	promptInput = function (terminalObj, message, PROMPT_TYPE) {
		var shouldDisplayInput = (PROMPT_TYPE === PROMPT_INPUT)
		var inputField = document.createElement('input')

		inputField.style.position = 'absolute'
		inputField.style.zIndex = '-100'
		inputField.style.outline = 'none'
		inputField.style.border = 'none'
		inputField.style.opacity = '0'
		inputField.style.fontSize = '0.2em'

		terminalObj._inputLine.textContent = ''
		terminalObj._input.style.display = 'block'
		terminalObj.html.appendChild(inputField)
		fireCursorInterval(inputField, terminalObj)

		if (message.length) terminalObj._promptLine.textContent = PROMPT_TYPE === PROMPT_CONFIRM ? message + ' (y/n)' : message

		inputField.onblur = function () {
			terminalObj._cursor.style.display = 'none'
		}

		inputField.onfocus = function () {
			inputField.value = terminalObj._inputLine.textContent
			terminalObj._cursor.style.display = 'inline'
		}

		terminalObj.html.onclick = function () {
			inputField.focus()
		}

		inputField.onkeydown = function (e) {
			if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9
				|| (e.ctrlKey && e.which === 76)) {
				e.preventDefault()
				if (e.which === 38 && terminalObj.bk_hist.length) {
					terminalObj.fw_hist.push(inputField.value)
					inputField.value = terminalObj.bk_hist.pop()
					terminalObj._inputLine.textContent = inputField.value
				} else if (e.which === 40 && terminalObj.fw_hist.length) {
					terminalObj.bk_hist.push(inputField.value)
					inputField.value = terminalObj.fw_hist.pop()
					terminalObj._inputLine.textContent = inputField.value
				} else if (e.ctrlKey && e.which === 76) {
					terminalObj.clear()
				}
			} else if (shouldDisplayInput && e.which !== 13) {
				setTimeout(function () {
					terminalObj._inputLine.textContent = inputField.value
				}, 1)
			}
		}

		inputField.onkeyup = function (e) {
			if (PROMPT_TYPE === PROMPT_CONFIRM || e.which === 13) {
				terminalObj._input.style.display = 'none'
				var inputValue = inputField.value
				if (shouldDisplayInput) {
					terminalObj.print(terminalObj._promptLine.textContent + inputValue)
					if (inputValue !== "") { 
						terminalObj.bk_hist.push(inputValue) 
						while (terminalObj.fw_hist.length) {
							terminalObj.bk_hist.push(terminalObj.fw_hist.pop())
						}
						let index = terminalObj.bk_hist.indexOf("")
						if (index) { terminalObj.bk_hist[index] = inputValue }
					}
				}
				terminalObj.html.removeChild(inputField)
				terminalObj.prompt(inputValue)
			}
		}

		if (firstPrompt) {
			firstPrompt = false
			setTimeout(function () { inputField.focus()	}, 50)
		} else {
			inputField.focus()
		}
	}

	var TerminalConstructor = function (id, functions, files) {
		this.functions = functions
		this.files = files
		this.cwd = '/'
		this.home = '/'

		this.bk_hist = []
		this.fw_hist = []

		this.html = document.createElement('div')
		this.html.className = 'Terminal'
		if (typeof(id) === 'string') { this.html.id = id }

		this._innerWindow = document.createElement('div')
		this._output = document.createElement('p')
		this._promptLine = document.createElement('span')
		this._inputLine = document.createElement('span') //the span element where the users input is put
		this._cursor = document.createElement('span')
		this._input = document.createElement('p') //the full element administering the user input, including cursor

		this._shouldBlinkCursor = true

		this.print = function (message) {
			var newLine = document.createElement('div')
			newLine.textContent = message
			newLine.className = 'stdout'
			this._output.appendChild(newLine)
		}

		this.error = function (message) {
			var newLine = document.createElement('div')
			newLine.textContent = message
			newLine.className = 'stderr'
			this.output(newLine)
		}

		this.output = function (element) {
			this._output.appendChild(element)
		}

		this.input = function (message) {
			promptInput(this, message, PROMPT_INPUT)
		}

		this.password = function (message) {
			promptInput(this, message, PROMPT_PASSWORD)
		}

		this.confirm = function (message) {
			promptInput(this, message, PROMPT_CONFIRM)
		}

		this.clear = function () {
			this._output.innerHTML = ''
		}

		this.sleep = function (milliseconds, callback) {
			setTimeout(callback, milliseconds)
		}

		this.setCwd = function (cwd) {
			this.cwd = cwd
		}

		this.setHome = function (home) {
			this.home = home
		}

		this.setTextSize = function (size) {
			this._output.style.fontSize = size
			this._input.style.fontSize = size
		}

		this.setTextColor = function (col) {
			this.html.style.color = col
			this._cursor.style.background = col
		}

		this.setBackgroundColor = function (col) {
			this.html.style.background = col
		}

		this.setWidth = function (width) {
			this.html.style.width = width
		}

		this.setHeight = function (height) {
			this.html.style.height = height
		}

		this.blinkingCursor = function (bool) {
			bool = bool.toString().toUpperCase()
			this._shouldBlinkCursor = (bool === 'TRUE' || bool === '1' || bool === 'YES')
		}

		this.ps1 = function () {
			return 'user@hostname ' + this.cwd + ' $ '
		}

		this.prompt = function (input) {
			if (input) {
				argv = input.split(' ')
				if (Object.keys(this.functions).includes(argv[0])) {
					this.functions[argv[0]](argv)
				} else {
					this.error('-bash: ' + argv[0] + ': command not	found')
				}
			}
			setTimeout(this.input(this.ps1()), 1)
		}

		this.parsePath = function (path) {
			if (!path) {
				path = this.cwd
			} else {
				// don't distinguish - vs _ or upper vs lower case
				path = path.replace('-', '_').toLowerCase()
			}

			let parray = path.split('/')
			if (!parray[parray.length - 1]) parray.pop()
			if (!parray[0]) {
				parray.shift()
			} else {
				// convert relative paths to absolute
				let cwd = this.cwd.split('/')
				if (!cwd[0]) cwd.shift()

				for (let i in parray) {
					switch (parray[i]) {
						case '.':
							continue
							break
						case '..':
							cwd.pop()
							break
						default:
							cwd.push(parray[i])
					}
				}
				parray = cwd
				path = '/' + cwd.join('/')
			}

			try {
				var dir = this.files
				for (let i in parray) {
					dir = dir.content['_' + parray[i]]
				}
			} catch (e) {
				dir = null
				path = this.cwd
			}
	
			return [dir, path]
		}

		this._input.appendChild(this._promptLine)
		this._input.appendChild(this._inputLine)
		this._input.appendChild(this._cursor)
		this._innerWindow.appendChild(this._output)
		this._innerWindow.appendChild(this._input)
		this.html.appendChild(this._innerWindow)

		this.setBackgroundColor('black')
		this.setTextColor('white')
		this.setTextSize('1em')
		this.setWidth('100%')
		this.setHeight('100%')

		this.html.style.fontFamily = 'Monaco, Courier'
		this.html.style.margin = '0'
		this._innerWindow.style.padding = '10px'
		this._input.style.margin = '0'
		this._output.style.margin = '0'
		this._cursor.style.background = 'white'
		this._cursor.innerHTML = 'C' //put something in the cursor..
		this._cursor.style.display = 'none' //then hide it
		this._input.style.display = 'none'
	}

	return TerminalConstructor
}())

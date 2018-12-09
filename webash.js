/* webash 0.0.0 | Copywrite (c) 2018 Tyler Grunenwald | https://github.com/tdgrunenwald/webash 

The MIT License (MIT)

Copyright (c) 2018 Tyler Grunenwald

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
const HOME = "/var/www"

var CWD = HOME // current working directory

// dirs/links/files are prefixed with an underscore
const _root = {
	type: 0,
	content: {
		_var: {
			type: 0, // 0 = dir, 1 = link, 2 = file
			content: {
				_www: {
					type: 0,
					content: {
						_about: {
							type: 2,
							content: "This is the about page"
						},
						_github: {
							type: 1,
							content: "https://github.com/tdgrunenwald"
						},
						_blog: {
							type: 0,
							content: {
								_hello_world: {
									type: 2,
									content: "Hello, World!"
								},
								_archived: {
									type: 0,
									content: {
										_old_crap: {
											type: 2,
											content: "This is an old dusty file"
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
}

function parsePath(path) {
	if (!path) {
		path = CWD
	} else {
		// don't distinguish - vs _ or upper vs lower case
		path = path.replace("-", "_").toLowerCase()
	}

	let parray = path.split("/")
	if (!parray[parray.length - 1]) parray.pop()
	if (!parray[0]) {
		parray.shift()
	} else {
		// convert relative paths to absolute
		let cwd = CWD.split("/")
		if (!cwd[0]) cwd.shift()

		for (let i in parray) {
			switch (parray[i]) {
				case ".":
					continue
					break
				case "..":
					cwd.pop()
					break
				default:
					cwd.push(parray[i])
			}
		}
		parray = cwd
		path = "/" + cwd.join("/")
	}

	try {
		var dir = _root
		for (let i in parray) {
			dir = dir.content["_" + parray[i]]
		}
	} catch (e) {
		term.print(e)
		dir = null
		path = CWD
	}
	
	return [dir, path]
}

function bashError(func, arg, error) {
	term.print("-bash: " + func + ": " + arg + ": " + error)
}

function ps1() {
	return "guest@tylergrunenwald.com " + CWD + " $ "
}

const functions = {
	clear: (argv) => { term.clear() },
	pwd: (argv) => { term.print(CWD) },
	echo: (argv) => { 
		let line = argv.join(" ")
		term.print(line.replace(argv[0], "").trim().replace(/\"/g, "")) 
	},
	ls: (argv) => { //ls(argv[1]) 
		let res = parsePath(argv[1])
		if (res[0]) {
			if (res[0].type === 0) {
				Object.keys(res[0].content).forEach((key) => {
					term.print(key.substring(1, key.length))
				})
			} else {
				term.print(res[1].substring(res[1].lastIndexOf("/") + 1, res[1].length))
			}
		} else {
			bashError("ls", argv[1], "No such file or directory")
		}
	},
	cd: (argv) => { //cd(argv[1]) 
		term.print("Not Implemented")
	},
	cat: (argv) => { //cat(argv[1]) 
		term.print("Not Implemented")
	}
}

function processInput(input) {
	if (input) {
		argv = input.split(" ")
		if (Object.keys(functions).includes(argv[0])) {
			functions[argv[0]](argv)
		} else {
			term.print("-bash: " + argv[0] + ": command not	found")
		}
	}
	term.input(ps1(), processInput)
}

// create terminal
var term = new Terminal()
document.body.appendChild(term.html)

// show initial prompt
term.input(ps1(), processInput)


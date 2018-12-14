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

// dirs/links/files are prefixed with an underscore
// types: 0 = dir, 1 = link, 2 = file
const files = {
	type: 0,
	content: {
		_var: {
			type: 0, 
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

function printPre(text) {
	let content = document.createElement('pre')
	content.textContent = text
	term.output(content)
}

function printFile(fname) {
	let row = document.createElement('div')
	let file = document.createElement('span')
	file.textContent = fname
	file.className = "file"
	row.textContent = "-rw-r--r--. tyler www-data "
	row.appendChild(file)
	term.output(row)
}

function printLink(lname, url) {
	let row = document.createElement('div')
	let link = document.createElement('a')
	let target = document.createElement('span')
	link.textContent = lname
	link.className = "link"
	link.href = url
	target.textContent = " -> " + url
	row.textContent = "lrwxrwxrwx. tyler www-data "
	row.appendChild(link)
	row.appendChild(target)
	term.output(row)
}

function printDirectory(dname) {
	let row = document.createElement('div')
	let dir = document.createElement('span')
	dir.textContent = dname + "/"
	dir.className = "directory"
	row.textContent = "drwxr-xr-x. tyler www-data "
	row.appendChild(dir)
	term.output(row)
}

function bashError(func, arg, error) {
	term.error("-bash: " + func + ": " + arg + ": " + error)
}

function error(func, arg, error) {
	term.error(func + ": " + arg + ": " + error)
}

const functions = {
	clear: (argv) => { term.clear() },
	pwd: (argv) => { term.print(CWD) },
	echo: (argv) => { 
		let line = argv.join(" ")
		term.print(line.replace(argv[0], "").trim().replace(/\"/g, "")) 
	},
	ls: (argv) => {
		let res = term.parsePath(argv[1])
		if (res[0]) {
			if (res[0].type === 0) {
				Object.keys(res[0].content).forEach((key) => {
					let name = key.substring(1, key.length)
					switch (res[0].content[key].type) {
						case 0: printDirectory(name); break;
						case 1: printLink(name, res[0].content[key].content); break;
						case 2: printFile(name); break;
						default: console.log("unknown file type: " + res[0].content[key].type)
					}
				})
			} else if (res[0].type === 1) {
				printLink(res[1].substring(res[1].lastIndexOf("/") + 1, res[1].length), res[0].content)
			} else {
				printFile(res[1].substring(res[1].lastIndexOf("/") + 1, res[1].length))
			}
		} else {
			bashError("ls", argv[1], "No such file or directory")
		}
	},
	cd: (argv) => {
		let res = term.parsePath(argv[1])
		if (res[0] && res[0].type === 0) {
			CWD = res[1]
		} else {
			bashError("cd", argv[1], "Not a directory")
		}
	},
	cat: (argv) => {
		let res = term.parsePath(argv[1])
		if (res[0] && res[0].type > 0) {
			printPre(res[0].content)
		} else if (res[0] && res[0].type === 0) {
			error("cat", argv[1], "Is a directory")
		} else {
			bashError("cat", argv[1], "No such file or directory")
		}
	}
}

// create terminal
var term = new Terminal("term", functions, files)
document.body.appendChild(term.html)

// show initial prompt
term.prompt()

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
const HOME = "/home/guest"
const dirs = new Object()
dirs[HOME] = ["about", "resume"]
dirs[HOME + "/projects"] = ["website"]
dirs[HOME + "/projects/github"] = ["hello-world"]

var CWD = HOME // current working directory

// create terminal
var term = new Terminal()
document.body.appendChild(term.html)

// handle input
function processInput(input) {
	if (input) {
		argv = input.split(" ")
		switch (argv[0]) {
			case "echo":
				term.print(input.replace(argv[0], "").trim().replace(/\"/g, ""))
				break;
			case "clear":
				term.clear()
				break;
			case "ls":
				if (argv[1]) { 
					ls(argv[1]) 
				} else { 
					ls()
				}
				break;
			case "cd":
				cd(argv[1])
				break;
			case "pwd":
				term.print(CWD)
				break;
			default:
				term.print("-bash: " + argv[0] + ": command not	found")
		}
	}
	term.input(ps1(), processInput)
}


function ls(dir) {
	if (!dir) {
		dir = CWD
	} else {
		dir = parsePath(dir)
	}

	if (Object.keys(dirs).includes(dir)) {
		let newListing = document.createElement('div')
		files = dirs[dir]
		for (x in files) {
			let span = document.createElement('span')
			span.textContent = files[x]
			span.style.marginRight = "20px"
			span.style.color = "lightblue"
			newListing.appendChild(span)
		}
		subDirs = getSubDirs(dir)
		for (x in subDirs) {
			let span = document.createElement('span')
			span.textContent = subDirs[x]
			span.style.marginRight = "20px"
			span.style.color = "blue"
			newListing.appendChild(span)
		}
		term._output.appendChild(newListing)
	} else {
		for (d in dirs) {
			for (f in dirs[d]) {
				if (dir === d + "/" + dirs[d][f]) {
					let file = document.createElement('div')
					file.textContent = dirs[d][f]
					file.style.color = "lightblue"
					term._output.appendChild(file)
					return
				}
			}
		}
		bashError("ls", dir, "No such file or directory")
	}
}

function cd(dir) {
	if (!dir) { 
		CWD = HOME
	} else {
		dir = parsePath(dir) // clean input
		if (Object.keys(dirs).includes(dir)) {
			CWD = dir
		} else {
			for (d in dirs) {
				for (f in dirs[d]) {
					if (dir === d + "/" + dirs[d][f]) {
						bashError("cd", dir, "Not a directory")
						return
					}
				}
			}
			bashError("cd", dir, "No such file or directory")
		}
	}
}

function parsePath(path) {
	if (![".", "/", "~"].includes(path[0])) path = CWD + "/" + path
	if (path.endsWith("/")) path = path.substring(0, path.length - 1)
	path = path.replace("..", CWD.substring(0, CWD.lastIndexOf("/")))
	path = path.replace(".", CWD)
	path = path.replace("~", HOME)
	return path
}

function bashError(func, arg, error) {
	term.print("-bash: " + func + ": " + arg + ": " + error)
}

function ps1() {
	return "guest@tylergrunenwald.com " + CWD.replace(HOME, "~") + " $ "
}

function getSubDirs(workingDir) {
	if (!workingDir) workingDir = CWD
	let subDirs = []
	Object.keys(dirs).forEach((key) => { 
		let regex = new RegExp(workingDir + "/([^/]+)/?.*")
		let match = regex.exec(key)
		if (match && !subDirs.includes(match[1])) subDirs.push(match[1]) 
	})
	return subDirs
}

// show initial prompt
term.input(ps1(), processInput)


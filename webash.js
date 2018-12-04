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
	}

	fileOp(dir, (fname, dname, findex) => {
		let file = document.createElement('div')
		file.textContent = dirs[dname][findex]
		file.className = 'file'
		term._output.appendChild(file)
	}, (fname, dname, findex) => {
		if (Object.keys(dirs).includes(fname)) {
			let newListing = document.createElement('div')
			files = dirs[fname]
			for (x in files) {
				let span = document.createElement('span')
				span.textContent = files[x]
				span.className = 'file'
				newListing.appendChild(span)
			}
			subDirs = getSubDirs(fname)
			for (x in subDirs) {
				let span = document.createElement('span')
				span.textContent = subDirs[x]
				span.className = 'directory'
				newListing.appendChild(span)
			}
			term._output.appendChild(newListing)
		} else {
			bashError("ls", fname, "No such file or directory")
		}
	})
}

function cd(dir) {
	if (!dir) { 
		CWD = HOME
	} else {
		fileOp(dir, (fname, dname, findex) => {
			bashError("cd", fname, "Not a directory")
		}, (fname, dname, findex) => {
			if (Object.keys(dirs).includes(fname)) {
				CWD = fname
			} else {
				bashError("cd", fname, "No such file or directory")
			}
		})
	}
}

function cat(file) {

}

function cleanPath(path) {
	if (![".", "/", "~"].includes(path[0])) path = CWD + "/" + path
	if (path.endsWith("/")) path = path.substring(0, path.length - 1)
	path = path.replace("..", CWD.substring(0, CWD.lastIndexOf("/")))
	path = path.replace(".", CWD)
	path = path.replace("~", HOME)
	return path
}

function fileOp(fname, onFile, onNotFile) {
	fname = cleanPath(fname)
	for (dname in dirs) {
		for (findex in dirs[dname]) {
			if (fname === dname + "/" + dirs[dname][findex]) {
				onFile(fname, dname, findex)
				return
			}
		}
	}
	onNotFile(fname, dname, findex)
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


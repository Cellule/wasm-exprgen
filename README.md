# Wasm-Exprgen

This is a tool to generate random WebAssembly programs using csmith and emscripten.

## Requirements

- Install [node.js & npm](https://nodejs.org/en/) version 0.10.17 and above
- Install [Python 2.x](https://www.python.org/download/releases/2.7/)
- Install [WebAssembly Interpreter](https://github.com/WebAssembly/spec/tree/master/interpreter#building) compiler dependencies (Optional)
  - Windows
    - [Ocaml](https://protz.github.io/ocaml-installer/)
  - Linux
    - [Ocaml](https://wasm.storage.googleapis.com/ocaml-4.02.2.tar.gz)
- Install Compiler
  - Windows
    - [Visual Studio 2010 or above](https://www.visualstudio.com/), tested on Visual Studio 2015
    - [cmake](https://cmake.org/download/)
  - Linux
    - gcc: `sudo apt-get install build-essential`
    - cmake: `sudo apt-get install cmake`
    - m4: `sudo apt-get install m4`

For more details on how to build Emscripten from source refer to [Emscripten Toolchain requirements](http://kripken.github.io/emscripten-site/docs/building_from_source/toolchain_what_is_needed.html)

## Setup

```bash
# Initialize submodule
git submodule update --init

# Install required modules for build scripts
npm install --production
```

## Building tools

```bash
npm run build-tools
```

## Usage

The following command will run csmith to generate a .c file then it runs emscripten to compile and generate WebAssembly from it.
It is possible for csmith to generate code that is not supported by llvm.

```bash
npm run gen
```

At this point, if it successfully built in llvm, there should be a a series of `test.*` files in the `output` directory.

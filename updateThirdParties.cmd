pushd %~dp0
call git submodule update --init
cd third_party\clang
call git fetch
call git checkout origin/incoming
cd ..\emscripten
call git fetch
call git checkout origin/incoming
cd ..\emscripten-fastcomp
call git fetch
call git checkout origin/incoming
cd ..\csmith
call git fetch
call git checkout origin/master
cd ..\wasm-spec
call git fetch
call git checkout origin/master
popd
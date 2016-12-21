@echo off
pushd %~dp0..
git submodule update --init
mklink /d third_party\emscripten-fastcomp\tools\clang third_party\clang
popd

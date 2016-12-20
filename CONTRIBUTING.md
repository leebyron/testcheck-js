# Contributing to TestCheck.js

We want to make contributing to this project as easy and transparent as
possible. Hopefully this document makes the process for contributing clear and
answers any questions you may have. If not, feel free to open an [Issue](https://github.com/leebyron/testcheck-js/issues).

## Pull Requests

All active development of TestCheck JS happens on GitHub. We actively welcome
your [pull requests](https://help.github.com/articles/creating-a-pull-request).

 1. Fork the repo and create your branch from `master`.
 2. If you've added code, add tests.
 3. If you've changed APIs, update the documentation.
 4. Ensure all dependencies are installed (you'll need `leiningen` and `node`).
 5. Ensure all tests pass. (`npm test`).

## `master` is unsafe

We will do our best to keep `master` in good shape, with tests passing at all
times. But in order to move fast, we might make API changes that your
application might not be compatible with. We will do our best to communicate
these changes and always [version](http://semver.org/) appropriately so you can
lock into a specific version if need be. If any of this is worrysome to you,
just use [npm](https://www.npmjs.org/package/testcheck).

## Issues

We use GitHub issues to track public bugs and requests. Please ensure your bug
description is clear and has sufficient instructions to be able to reproduce the
issue. The best way is to provide a reduced test case on jsFiddle or jsBin.

## License

By contributing to TestCheck JS, you agree that your contributions will be
licensed under its BSD license.

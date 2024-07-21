# Distributed Lock

---

[![Regression](https://github.com/0xTheProDev/distributed-lock/actions/workflows/regression.yml/badge.svg?style=for-the-badge)](https://github.com/0xTheProDev/distributed-lock/actions/workflows/regression.yml)
[![Release](https://github.com/0xTheProDev/distributed-lock/actions/workflows/release.yml/badge.svg?style=for-the-badge)](https://github.com/0xTheProDev/distributed-lock/actions/workflows/release.yml)

[![Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#white)](https://github.com/sponsors/0xTheProDev)
[![Npm Version](https://img.shields.io/npm/v/@0xtheprodev/distributed-lock?style=for-the-badge)](https://www.npmjs.com/package/@0xtheprodev/distributed-lock)
[![Weekly Downloads](https://img.shields.io/npm/dw/@0xtheprodev/distributed-lock?style=for-the-badge)](https://www.npmjs.com/package/@0xtheprodev/distributed-lock)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@0xtheprodev/distributed-lock?style=for-the-badge)](https://www.npmjs.com/package/@0xtheprodev/distributed-lock)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@0xtheprodev/distributed-lock?style=for-the-badge)](https://www.npmjs.com/package/@0xtheprodev/distributed-lock)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@0xtheprodev/distributed-lock?style=for-the-badge)](https://www.npmjs.com/package/@0xtheprodev/distributed-lock)
[![Types](https://img.shields.io/npm/types/@0xtheprodev/distributed-lock?style=for-the-badge)](https://www.npmjs.com/package/@0xtheprodev/distributed-lock)
[![License](https://img.shields.io/github/license/0xTheProDev/distributed-lock?style=for-the-badge&label=licens)](https://github.com/0xTheProDev/distributed-lock/blob/main/LICENSE)
[![Open Issues](https://img.shields.io/github/issues-raw/0xTheProDev/distributed-lock?style=for-the-badge)](https://github.com/0xTheProDev/distributed-lock/issues)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/0xTheProDev/distributed-lock?style=for-the-badge)](https://github.com/0xTheProDev/distributed-lock/issues?q=is%3Aissue+is%3Aclosed)
[![Open Pulls](https://img.shields.io/github/issues-pr-raw/0xTheProDev/distributed-lock?style=for-the-badge)](https://github.com/0xTheProDev/distributed-lock/pulls)
[![Closed Pulls](https://img.shields.io/github/issues-pr-closed-raw/0xTheProDev/distributed-lock?style=for-the-badge)](https://github.com/0xTheProDev/distributed-lock/pulls?q=is%3Apr+is%3Aclosed)
[![Stars](https://img.shields.io/github/stars/0xTheProDev/distributed-lock?style=for-the-badge)](https://github.com/0xTheProDev/distributed-lock/stargazers)
[![Forks](https://img.shields.io/github/forks/0xTheProDev/distributed-lock?style=for-the-badge)](https://github.com/0xTheProDev/distributed-lock/network/members)
[![Discussions](https://img.shields.io/github/discussions/0xTheProDev/distributed-lock?style=for-the-badge)](https://github.com/0xTheProDev/distributed-lock/discussions)
[![Contributors](https://img.shields.io/github/contributors/0xTheProDev/distributed-lock?style=for-the-badge)](https://github.com/0xTheProDev/distributed-lock/graphs/contributors)
[![Activity](https://img.shields.io/github/last-commit/0xTheProDev/distributed-lock?style=for-the-badge&label=most%20recent%20activity)](https://github.com/0xTheProDev/distributed-lock/pulse)

## Description

> A Distributed Locking Mechanism implemented using Redis to provide Mutual Exclusion over Shared Resources in a Microservices Architecture.

In modern digital systems, we are often working with Distributed Workloads, Horizontal Scaling and Microservices. These systems do not share the same memory spaces or sometimes even the same host machine. Because of which traditional Mutex and Semaphore does not adapt with the current requirements to acquire exclusive access to shared resources. This library aims to bridge that gap using a common Remote Dictionary Server (Redis) with special attention to easy to integrate APIs and performance.

## Installation

Install this package using your preferred package manager. See the example of [yarn](https://yarnpkg.com):

```sh
yarn add @0xtheprodev/distributed-lock
```

## Usage

Most common usage entails executing a block of code (asynchronous functions are supported) within a Mutual Exclusion region which ensures that no other code is being executed on the same resources.

```ts
import DistributedLock from "@0xtheprodev/distributed-lock";

const distributedLock = new DistributedLock({
  host: "redis-internal.example.com",
  port: 6379,
});

async function runExclusively() {
  return await distributedLock.execute("fetch", async () =>
    fetch("https://http.cat/200"),
  );
}
```

For any further usage, refer to the [Type Declaration](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) shipped with the package. Make sure your editor or IDE is capable of powering intellisense from the declaration file provided.

## Testing

- To run all the unit test suites, run the following after all the dependencies have been installed:

```sh
yarn test
```

- To collect coverage on the tested files, execute the following command:

```sh
yarn test:cov
```

## Reporting a Bug

Head on to [**Discussion**](https://github.com/0xTheProDev/distributed-lock/discussions) section to report a bug or to ask for any feature. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Changelog

See [CHANGELOG](https://github.com/0xTheProDev/distributed-lock/blob/main/CHANGELOG.md) for more details on what has been changed in the latest release.

## Contributing

See [Contributing Guidelines](https://github.com/0xTheProDev/distributed-lock/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/0xTheProDev/distributed-lock/blob/main/LICENSE) for more details.

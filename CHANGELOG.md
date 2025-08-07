# Changelog

## 0.7.0 (2025-08-07)

### Features

* **App.tsx:** remove resources from app.tsx ([f959b7d](https://github.com/Matteo-Grellier/Monitoverse/commit/f959b7d6271fa8038398a84f308043333a2bbba5))

### Bug Fixes

* **App.tsx:** add terminal component to app.tsx ([06741eb](https://github.com/Matteo-Grellier/Monitoverse/commit/06741eb73e4864c7d558fb37446d907cc4031ca2))

## 0.6.0 (2025-08-07)

### Features

* **doc:** add docs folder + complete documentation ([806fc30](https://github.com/Matteo-Grellier/Monitoverse/commit/806fc3004dda41f8e29fadb7b0a6509833055d81))

## 0.5.0 (2025-08-04)

### Features

**readme** update README with unittests ([43efc](https://github.com/Matteo-Grellier/Monitoverse/commit/43efc475a73037120b2bfc29f6d225ce42f27347))

### Bug Fixes

* **ci:** remove lines with .env.example because the file does not exist anymore ([2d4d345](https://github.com/Matteo-Grellier/Monitoverse/commit/2d4d345b2f56d6fe9e99aff86f8e7fb8886fcdc1))
* **unittest:** the mock token was not setup ([3d07cd2](https://github.com/Matteo-Grellier/Monitoverse/commit/3d07cd2087bbc62ac0a301b1baad1568654882f7))

## 0.4.1 (2025-07-24)

### Bug Fixes

* **releases:** wrong version number ([689872a](https://github.com/Matteo-Grellier/Monitoverse/commit/689872a17a47e801df823edc444c8ae32bb4d451))

## 0.4.0 (2025-07-24)

### Features

* **JWT:** add JWT authentification — user cannot access other pages if he's not logged in ([929f3eb](https://github.com/Matteo-Grellier/Monitoverse/commit/929f3eb2c61957e26942fe0daecb08383a337e43))
* **cors:** setup cors for production ([21ff6fb](https://github.com/Matteo-Grellier/Monitoverse/commit/21ff6fbff0fdcb55b7614b1202b71d882aa4390d))
* **readme:** add instructions to the readme ([48fa207](https://github.com/Matteo-Grellier/Monitoverse/commit/48fa207866597b018b7b1212145aa271c9771308))

### Refactors

* **release:** rework docker-compose and .env files ([3e99f66](https://github.com/Matteo-Grellier/Monitoverse/commit/3e99f66aaab531a97e83c9293eff3283144d2202))
* **auth:** move auth utility functions to handlers package; create `AuthenticateUser` function + resolve DRY problem due to reusing `GetUserByEmail` ([a00c161](https://github.com/Matteo-Grellier/Monitoverse/commit/a00c161a91fbb022b6ba9528bbbcf18456e31f9f))

### Bug Fixes

* **rebase:** fix a forgotten rebase error ([37947e2](https://github.com/Matteo-Grellier/Monitoverse/commit/37947e218f71d2b7915503246b3ea93c7605b5f9))

## 0.3.0 (2025-07-24)

### Features

* **terminal:** add terminal dashboard ([10e5c9d](https://github.com/Matteo-Grellier/Monitoverse/commit/10e5c9d639edd5cb9d101a27b799799ac0ffca86)) ([26d45d0](https://github.com/Matteo-Grellier/Monitoverse/commit/26d45d01962c8d1592c995a6d046eae99e88de9d))
* **components:** add components for terminal ([60e2c79](https://github.com/Matteo-Grellier/Monitoverse/commit/60e2c79fbb2d7b916f1924d51486d7e34460ed80))

### Bug Fixes

* **terminal:** can execute sudo commands on host machine ([6cb11f9](https://github.com/Matteo-Grellier/Monitoverse/commit/6cb11f94a0c14e015f995dc1976bb4b1d760216f)) ([279e3b7](https://github.com/Matteo-Grellier/Monitoverse/commit/279e3b78023a8983ebd2d3f2d6d4c558dc0443aa))
* **lighthouse:** add /terminal path ([1a4ffe4](https://github.com/Matteo-Grellier/Monitoverse/commit/1a4ffe4ec5258a6d4a2772922782972b6abe7b23))

## 0.2.2 (2025-07-09)

### Bug Fixes

* **release-it:** fix config ([3e993ee](https://github.com/Matteo-Grellier/Monitoverse/commit/3e993ee3185ee7abd297f312dde8f5f7624e2aca))

## 0.2.1 (2025-07-09)

# [0.2.0](https://github.com/Matteo-Grellier/Monitoverse/compare/9825d9854c460c6da33d369d9946251136aa31d6...0.2.0) (2025-07-07)

### Bug Fixes

- **ci:** change ci file ([43b993e](https://github.com/Matteo-Grellier/Monitoverse/commit/43b993e1cf4932d5b7d4d5fd0f3c66998d02c262))
- **config:** update go version + add hot reload for go ([2f21b08](https://github.com/Matteo-Grellier/Monitoverse/commit/2f21b08fd0961aac6552e3ab9228dcfcd42c5741))
- **lint:** fix lint errors ([6e12246](https://github.com/Matteo-Grellier/Monitoverse/commit/6e1224694d391adef64827f8aae692b9b967a6f3))
- **semantic-release:** fix semantic-release ([f8195dd](https://github.com/Matteo-Grellier/Monitoverse/commit/f8195dd52c52b2ab2fd13c3ac22cbe8bd12db6e8))

### Features

- **back + front:** Rework the project and add semantic-release to the project ([#2](https://github.com/Matteo-Grellier/Monitoverse/issues/2)) ([28fde34](https://github.com/Matteo-Grellier/Monitoverse/commit/28fde349cc84871ab9bba3251367c93a452f9ae6))
- **ci-cd:** update ci-pr.yml ([a50c12c](https://github.com/Matteo-Grellier/Monitoverse/commit/a50c12cb5107f6ab88a94f82815b4be66c2d0534))
- **css:** add pandacss ([b6debe3](https://github.com/Matteo-Grellier/Monitoverse/commit/b6debe30bf699219ed55eae3344343121b98514b))
- **docker:** create docker-compose + containerized everything ([84dfd8e](https://github.com/Matteo-Grellier/Monitoverse/commit/84dfd8eac0f4f86cdf8413f900b9d51b2c857154))
- **front:** Create react front with vite ([9825d98](https://github.com/Matteo-Grellier/Monitoverse/commit/9825d9854c460c6da33d369d9946251136aa31d6))
- **front:** Replace old front by React-Admin ([5750a4d](https://github.com/Matteo-Grellier/Monitoverse/commit/5750a4d8eadcb7c06c88511c26cea9501657b73c))
- **husky:** add commitlint for check commit-msg ([e404aa7](https://github.com/Matteo-Grellier/Monitoverse/commit/e404aa7db2e4cc5eaeccbc56c50ad3e2065ae668))
- **husky:** Add husky ([72ced82](https://github.com/Matteo-Grellier/Monitoverse/commit/72ced82b11ab1fea79d8f80b4f802779525e49d7))
- **lighthouse:** add lighthouse workflow ([1e57735](https://github.com/Matteo-Grellier/Monitoverse/commit/1e57735b0c01038667dc6c805e674caf0ca209d5))
- **release-it:** add release-it ([c4e725c](https://github.com/Matteo-Grellier/Monitoverse/commit/c4e725ce4c521f0ffe2c767e817b785e5ddda428))
- **release-please:** use release-please ([5789a49](https://github.com/Matteo-Grellier/Monitoverse/commit/5789a49be67aa813841c7919007ccf4e042a70bb))
- **shadcn:** add shadcn to the project ([8ba241d](https://github.com/Matteo-Grellier/Monitoverse/commit/8ba241d5547d3e964d0ae5766257ab740cdf1fbf))
- **test+workflow:** create a test and adjust workflow ([b9c6b4e](https://github.com/Matteo-Grellier/Monitoverse/commit/b9c6b4e8844100af5763de7a7778c781345ffbb5))

### Reverts

- Revert "add register/login (#4)" (#5) ([06ca404](https://github.com/Matteo-Grellier/Monitoverse/commit/06ca40445de773dca162792f28b3dd19fc53ee61)), closes [#4](https://github.com/Matteo-Grellier/Monitoverse/issues/4) [#5](https://github.com/Matteo-Grellier/Monitoverse/issues/5)

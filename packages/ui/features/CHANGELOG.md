# @wallet-standard/ui-features

## 1.0.2

### Patch Changes

- 61ce8fe: @wallet-standard/ui-registry exports are renamed to drop the \_DO_NOT_USE_OR_YOU_WILL_BE_FIRED suffix (e.g. getWalletForHandle, registerWalletHandle). Depending on this package is itself the opt-in for UI library authors, so the in-name warning was redundant. The suffixed names remain as @deprecated aliases.
- Updated dependencies [61ce8fe]
- Updated dependencies [faa86f4]
    - @wallet-standard/ui-registry@1.1.0

## 1.0.1

### Patch Changes

- Updated dependencies [0ad915c]
    - @wallet-standard/errors@0.1.1
    - @wallet-standard/ui-registry@1.0.1

## 1.0.0

### Major Changes

- 96e237c: Release 1.0.0 of previously unreleased packages

### Patch Changes

- 96e237c: A specialized function that fetches the underlying feature object from a `UiWalletAccount`, ensuring that both the wallet _and_ the account indicate support for that feature.
- 96e237c: A function that you can use to materialize a wallet feature by name, given a `UiWallet` or `UiWalletAccount`
- Updated dependencies [96e237c]
- Updated dependencies [96e237c]
- Updated dependencies [96e237c]
- Updated dependencies [96e237c]
- Updated dependencies [96e237c]
- Updated dependencies [96e237c]
    - @wallet-standard/errors@0.1.0
    - @wallet-standard/base@1.1.0
    - @wallet-standard/ui-core@1.0.0
    - @wallet-standard/ui-registry@1.0.0

# changelog

## 2.0

- Simplified internal data structure with no scope for listener name
- `getListeners()` function is added
- `addListener()`
  - now returns nothing
  - no longer cheks duplicate entries
- `removeListener()`
  - now supports for entire listener removal from a target
  - support for name based removal across the types is also added
  - When a function is set to specifiy a listener, it's now treated as a conditiion even if listener name is specified as type suffix
  
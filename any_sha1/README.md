# any_sha1

This package provides JavaScript functions for abstracting SHA-1
implementations, providing a uniform signature and interface.

When `module` is defined, this function will require and use the `crypto`
module to produce the SHA-1 hash.

Otherwise, it will detect and use SHA-1 functions from the following projects,
in order:

- `require("crypto")`, for NodeJS / browserify (based on the presence of
  `module`)
- [Rusha](https://github.com/srijs/rusha)
- [Forge](https://github.com/digitalbazaar/forge#sha1)
- [SJCL](https://github.com/bitwiseshiftleft/sjcl)
- [jsSHA](https://github.com/Caligatio/jsSHA)
- [Paul Johnston's hex_sha1 function](http://pajhome.org.uk/crypt/md5/)
- [CryptoJS](https://code.google.com/p/crypto-js/)
- [PolyCrypt](https://github.com/polycrypt/polycrypt)

(Pull requests to add more implementations are welcome.)

## any_sha1.from(opts)

Detects for the presence of the projects listed above, and returns the first
function from `opts` that matches a detected environment (or `null`, if no
recognized SHA-1 implementation was found).

The "opts" parameter is expected to come from one of the sets defined below,
where the first level is the input encoding to hash (eg. 'utf8') and the
second level is the output type (eg. 'bytes' for an array of byte values).

## any_sha1.define(opts,[obj,[key,[chooser]]])

Defines `key` (by default, `sha1`) in `obj` (by default, `window`) to the
function in `opts` selected by `chooser` (by default, `any_sha1.from`).

If no appropriate SHA-1 function is found (`chooser(opts)` returns `null`),
this function will return / define a function that will attept to define the
SHA-1 function when first called, allowing for a late-binding approach where
the appropriate SHA-1 implementation is introduced after this function is
invoked.

## Input encodings: any_sha1.utf8

Output options under this encoding type treat extended characters in the given
string outside the ASCII set as their UTF-8 byte representations. (Due to the
modern ubiquity of the UTF-8 encoding, nowadays, this is usually what you
want: as such, for the moment, this is the only input encoding this package
provides.)

For SHA-1 functions that don't handle strings with character codes outside the
0-255 range (pretty much all of them), the string will first be converted to
UTF-8 via the [unescape-encodeURIComponent method][1].

[1]: http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html

## Output options: any_sha1.utf8.bytes

Returns the SHA-1 hash as an array of byte values.

## Example usage

To define a default SHA-1 function for [hashblot][], allowing for late binding:

```
any_sha1.define(any_sha1.utf8.bytes, hashblot);
```

[hashblot]: https://github.com/stuartpb/hashblot

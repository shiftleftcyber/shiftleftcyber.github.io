/* SecureSBOM attestation reference guide: explorer + in-browser verification walkthrough.
 * Generated example data lives in DATA (real messages from the SecureSBOM API, demo key).
 * No network calls: everything runs locally with the Web Crypto API. */
(function () {
  "use strict";

  var DATA = {
 "tabs": {
  "sign-request": {
   "endpoint": "POST /api/v2/attestations/sign  (request body)",
   "body": {
    "key_id": "b9e57a16-9822-4c81-9092-4342d50246bc",
    "subject": [
     {
      "name": "registry.example.com/app",
      "digest": {
       "sha256": "a3f5c1d2e4b6a7980f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778"
      }
     }
    ],
    "sbom": {
     "bomFormat": "CycloneDX",
     "components": [
      {
       "licenses": [
        {
         "license": {
          "id": "MIT"
         }
        }
       ],
       "name": "example-library",
       "purl": "pkg:maven/org.example/example-library@2.0.0",
       "type": "library",
       "version": "2.0.0"
      }
     ],
     "dependencies": [
      {
       "dependsOn": [],
       "ref": "pkg:maven/org.example/example-library@2.0.0"
      }
     ],
     "metadata": {
      "component": {
       "name": "Example Application",
       "type": "application",
       "version": "1.0.0"
      },
      "timestamp": "2024-10-22T12:00:00Z",
      "tools": [
       {
        "name": "SBOM Generator",
        "vendor": "ACME Corp",
        "version": "1.0.0"
       }
      ]
     },
     "serialNumber": "urn:uuid:123e4567-e89b-12d3-a456-426614174000",
     "specVersion": "1.6",
     "version": 1
    },
    "predicate_signature": "embedded"
   },
   "notes": {
    "key_id": "sq-key",
    "subject": "sq-subject",
    "subject[].digest.sha256": "sq-digest",
    "sbom": "sq-sbom",
    "predicate_signature": "sq-mode"
   }
  },
  "sign-response": {
   "endpoint": "POST /api/v2/attestations/sign  (200 response)",
   "body": {
    "attestation": {
     "payloadType": "application/vnd.in-toto+json",
     "payload": "eyJfdHlwZSI6Imh0dHBzOi8vaW4tdG90by5pby9TdGF0ZW1lbnQvdjEiLCJwcmVkaWNhdGUiOnsiYm9tRm9ybWF0IjoiQ3ljbG9uZURYIiwiY29tcG9uZW50cyI6W3sibGljZW5zZXMiOlt7ImxpY2Vuc2UiOnsiaWQiOiJNSVQifX1dLCJuYW1lIjoiZXhhbXBsZS1saWJyYXJ5IiwicHVybCI6InBrZzptYXZlbi9vcmcuZXhhbXBsZS9leGFtcGxlLWxpYnJhcnlAMi4wLjAiLCJ0eXBlIjoibGlicmFyeSIsInZlcnNpb24iOiIyLjAuMCJ9XSwiZGVwZW5kZW5jaWVzIjpbeyJkZXBlbmRzT24iOltdLCJyZWYiOiJwa2c6bWF2ZW4vb3JnLmV4YW1wbGUvZXhhbXBsZS1saWJyYXJ5QDIuMC4wIn1dLCJtZXRhZGF0YSI6eyJjb21wb25lbnQiOnsibmFtZSI6IkV4YW1wbGUgQXBwbGljYXRpb24iLCJ0eXBlIjoiYXBwbGljYXRpb24iLCJ2ZXJzaW9uIjoiMS4wLjAifSwidGltZXN0YW1wIjoiMjAyNC0xMC0yMlQxMjowMDowMFoiLCJ0b29scyI6W3sibmFtZSI6IlNCT00gR2VuZXJhdG9yIiwidmVuZG9yIjoiQUNNRSBDb3JwIiwidmVyc2lvbiI6IjEuMC4wIn1dfSwic2VyaWFsTnVtYmVyIjoidXJuOnV1aWQ6MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwIiwic2lnbmF0dXJlIjp7ImFsZ29yaXRobSI6IkVTMjU2Iiwia2V5SWQiOiJiOWU1N2ExNi05ODIyLTRjODEtOTA5Mi00MzQyZDUwMjQ2YmMiLCJwdWJsaWNLZXkiOnsiY3J2IjoiUC0yNTYiLCJrdHkiOiJFQyIsIngiOiJIczZLbG9PM2ZZZmt1ZFFadG56LWRxY2gxTnlmWkZOcWtMWVFJdmlSWFNNIiwieSI6IklpRkNYWW1pdE5oTlRqM19RbDZaRVZsdzdiT2IzT0RkUmZHSm1kaEk4b28ifSwidmFsdWUiOiJNRVVDSURYazU5ZXNBQ1hxQ3VuenZqOFdvSWo3WDczdFlCZUFvRjNWb0RXbXpySXJBaUVBMnE1MjlvWkhnSEh6YmRGWGhCbTQ3X2ZqSGZJamh0dUdkMmlCZTZ4cTNJcyJ9LCJzcGVjVmVyc2lvbiI6IjEuNiIsInZlcnNpb24iOjF9LCJwcmVkaWNhdGVUeXBlIjoiaHR0cHM6Ly9jeWNsb25lZHgub3JnL2JvbSIsInN1YmplY3QiOlt7ImRpZ2VzdCI6eyJzaGEyNTYiOiJhM2Y1YzFkMmU0YjZhNzk4MGYxZTJkM2M0YjVhNjk3ODg3OTZhNWI0YzNkMmUxZjAwMTEyMjMzNDQ1NTY2Nzc4In0sIm5hbWUiOiJyZWdpc3RyeS5leGFtcGxlLmNvbS9hcHAifV19",
     "signatures": [
      {
       "keyid": "b9e57a16-9822-4c81-9092-4342d50246bc",
       "sig": "MEUCIANkgjvjp2mZ/hEIqcEmxzkgYAI/I9TWJaK+ytfqUhIEAiEA/MJoGFxuV4RmYij4gqkMVOdcfd7t0ftrYaAin24NIVw="
      }
     ]
    },
    "media_type": "application/vnd.dsse.envelope.v1+json",
    "predicate_type": "https://cyclonedx.org/bom",
    "predicate_signature": {
     "mode": "embedded"
    },
    "subject": [
     {
      "name": "registry.example.com/app",
      "digest": {
       "sha256": "a3f5c1d2e4b6a7980f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778"
      }
     }
    ],
    "key_id": "b9e57a16-9822-4c81-9092-4342d50246bc",
    "algorithm": "ES256",
    "statement_sha256": "26f4e5fa7759bc493f455d9897e1953317278e5f9c1f4fce6c0150d853912130"
   },
   "envelopePath": "attestation",
   "notes": {
    "attestation": "sr-envelope",
    "attestation.payload": "sr-payload",
    "attestation.signatures": "sr-sig",
    "media_type": "sr-media",
    "predicate_type": "sr-ptype",
    "predicate_signature": "sr-mode",
    "statement_sha256": "sr-sha"
   }
  },
  "verify-request": {
   "endpoint": "POST /api/v2/attestations/verify  (request body)",
   "body": {
    "key_id": "b9e57a16-9822-4c81-9092-4342d50246bc",
    "attestation": {
     "payloadType": "application/vnd.in-toto+json",
     "payload": "eyJfdHlwZSI6Imh0dHBzOi8vaW4tdG90by5pby9TdGF0ZW1lbnQvdjEiLCJwcmVkaWNhdGUiOnsiYm9tRm9ybWF0IjoiQ3ljbG9uZURYIiwiY29tcG9uZW50cyI6W3sibGljZW5zZXMiOlt7ImxpY2Vuc2UiOnsiaWQiOiJNSVQifX1dLCJuYW1lIjoiZXhhbXBsZS1saWJyYXJ5IiwicHVybCI6InBrZzptYXZlbi9vcmcuZXhhbXBsZS9leGFtcGxlLWxpYnJhcnlAMi4wLjAiLCJ0eXBlIjoibGlicmFyeSIsInZlcnNpb24iOiIyLjAuMCJ9XSwiZGVwZW5kZW5jaWVzIjpbeyJkZXBlbmRzT24iOltdLCJyZWYiOiJwa2c6bWF2ZW4vb3JnLmV4YW1wbGUvZXhhbXBsZS1saWJyYXJ5QDIuMC4wIn1dLCJtZXRhZGF0YSI6eyJjb21wb25lbnQiOnsibmFtZSI6IkV4YW1wbGUgQXBwbGljYXRpb24iLCJ0eXBlIjoiYXBwbGljYXRpb24iLCJ2ZXJzaW9uIjoiMS4wLjAifSwidGltZXN0YW1wIjoiMjAyNC0xMC0yMlQxMjowMDowMFoiLCJ0b29scyI6W3sibmFtZSI6IlNCT00gR2VuZXJhdG9yIiwidmVuZG9yIjoiQUNNRSBDb3JwIiwidmVyc2lvbiI6IjEuMC4wIn1dfSwic2VyaWFsTnVtYmVyIjoidXJuOnV1aWQ6MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwIiwic2lnbmF0dXJlIjp7ImFsZ29yaXRobSI6IkVTMjU2Iiwia2V5SWQiOiJiOWU1N2ExNi05ODIyLTRjODEtOTA5Mi00MzQyZDUwMjQ2YmMiLCJwdWJsaWNLZXkiOnsiY3J2IjoiUC0yNTYiLCJrdHkiOiJFQyIsIngiOiJIczZLbG9PM2ZZZmt1ZFFadG56LWRxY2gxTnlmWkZOcWtMWVFJdmlSWFNNIiwieSI6IklpRkNYWW1pdE5oTlRqM19RbDZaRVZsdzdiT2IzT0RkUmZHSm1kaEk4b28ifSwidmFsdWUiOiJNRVVDSURYazU5ZXNBQ1hxQ3VuenZqOFdvSWo3WDczdFlCZUFvRjNWb0RXbXpySXJBaUVBMnE1MjlvWkhnSEh6YmRGWGhCbTQ3X2ZqSGZJamh0dUdkMmlCZTZ4cTNJcyJ9LCJzcGVjVmVyc2lvbiI6IjEuNiIsInZlcnNpb24iOjF9LCJwcmVkaWNhdGVUeXBlIjoiaHR0cHM6Ly9jeWNsb25lZHgub3JnL2JvbSIsInN1YmplY3QiOlt7ImRpZ2VzdCI6eyJzaGEyNTYiOiJhM2Y1YzFkMmU0YjZhNzk4MGYxZTJkM2M0YjVhNjk3ODg3OTZhNWI0YzNkMmUxZjAwMTEyMjMzNDQ1NTY2Nzc4In0sIm5hbWUiOiJyZWdpc3RyeS5leGFtcGxlLmNvbS9hcHAifV19",
     "signatures": [
      {
       "keyid": "b9e57a16-9822-4c81-9092-4342d50246bc",
       "sig": "MEUCIANkgjvjp2mZ/hEIqcEmxzkgYAI/I9TWJaK+ytfqUhIEAiEA/MJoGFxuV4RmYij4gqkMVOdcfd7t0ftrYaAin24NIVw="
      }
     ]
    },
    "expected_digest": {
     "sha256": "a3f5c1d2e4b6a7980f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778"
    }
   },
   "envelopePath": "attestation",
   "notes": {
    "key_id": "vq-key",
    "attestation": "vq-att",
    "expected_digest": "vq-digest"
   }
  },
  "verify-response": {
   "endpoint": "POST /api/v2/attestations/verify  (200 response)",
   "body": {
    "verified": true,
    "key_id": "b9e57a16-9822-4c81-9092-4342d50246bc",
    "algorithm": "ES256",
    "key_type": "attestation",
    "predicate_type": "https://cyclonedx.org/bom",
    "matched_subject": {
     "name": "registry.example.com/app",
     "digest": {
      "sha256": "a3f5c1d2e4b6a7980f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778"
     }
    },
    "checks": {
     "signature": "valid",
     "payload_canonical": "valid",
     "subject_match": "valid",
     "predicate_signature": "valid"
    },
    "statement_sha256": "26f4e5fa7759bc493f455d9897e1953317278e5f9c1f4fce6c0150d853912130"
   },
   "notes": {
    "verified": "vr-verified",
    "key_type": "vr-keytype",
    "predicate_type": "vr-ptype",
    "matched_subject": "vr-matched",
    "checks": "vr-checks",
    "statement_sha256": "vr-sha"
   }
  }
 },
 "notes": {
  "sq-key": {
   "field": "key_id",
   "body": "An <strong>attestation</strong> key (created through the API with <code>key_type: \"attestation\"</code>, ES256). A standard signing key is rejected with <code>403 key_purpose_mismatch</code>, and attestation keys can't sign plain SBOMs or digests."
  },
  "sq-subject": {
   "field": "subject",
   "body": "The artifact this SBOM describes. <code>name</code> is how consumers find it, such as an image reference, file name or package URL. You can list more than one subject."
  },
  "sq-digest": {
   "field": "subject[].digest.sha256",
   "body": "The SHA-256 of the <strong>artifact itself</strong> (for example, the image manifest digest), as 64 lowercase hex characters. It is not the SBOM's hash. This value binds the SBOM to the artifact."
  },
  "sq-sbom": {
   "field": "sbom",
   "body": "The SBOM as a JSON <em>object</em> (CycloneDX, SPDX or AI-SBOM), not a string. It must pass SecureSBOM validation and must not already be signed (<code>predicate_already_signed</code>). Integers above 2<sup>53</sup> and duplicate keys are rejected so the JSON can be canonicalized."
  },
  "sq-mode": {
   "field": "predicate_signature",
   "body": "<code>embedded</code> adds an SBOM signature inside the predicate, so the SBOM verifies on its own after it is extracted (the CycloneDX and AI-SBOM default). <code>detached</code> returns it separately (the SPDX default). <code>none</code> relies on the envelope signature alone."
  },
  "sr-envelope": {
   "field": "attestation",
   "body": "The DSSE envelope. Store and distribute it <strong>exactly as returned</strong> with media type <code>application/vnd.dsse.envelope.v1+json</code>, for example as an OCI referrer or a release asset."
  },
  "sr-payload": {
   "field": "attestation.payload",
   "body": "Base64 of the canonical in-toto Statement bytes. Turn on <em>Show decoded payload</em> to look inside. The signature covers these exact bytes, so never decode and re-encode the payload."
  },
  "sr-sig": {
   "field": "attestation.signatures",
   "body": "<code>keyid</code> must equal your <code>key_id</code>. <code>sig</code> is an ES256 (DER, base64) signature over the PAE: <code>DSSEv1 28 application/vnd.in-toto+json 1140 &lt;payload bytes&gt;</code>."
  },
  "sr-media": {
   "field": "media_type",
   "body": "The media type to use wherever the envelope is stored or attached."
  },
  "sr-ptype": {
   "field": "predicate_type",
   "body": "Matches the SBOM format: <code>https://cyclonedx.org/bom</code>, <code>https://spdx.dev/Document</code> or <code>https://shiftleftcyber.io/attestation/ai-sbom/v1</code>."
  },
  "sr-mode": {
   "field": "predicate_signature",
   "body": "The SBOM signature mode that was applied. In <code>detached</code> mode this object also carries the signature. Keep it next to the attestation, because verifiers need it."
  },
  "sr-sha": {
   "field": "statement_sha256",
   "body": "SHA-256 of the decoded payload bytes. Record it. The verify response returns the same value, so it works as a join key for audit logs."
  },
  "dp-type": {
   "field": "_type",
   "body": "Must be <code>https://in-toto.io/Statement/v1</code>."
  },
  "dp-subject": {
   "field": "subject",
   "body": "The artifact name and digest you signed. Confirm this is the artifact you intended <em>before</em> you publish."
  },
  "dp-ptype": {
   "field": "predicateType",
   "body": "The SBOM format of the predicate."
  },
  "dp-predsig": {
   "field": "predicate.signature",
   "body": "The embedded SBOM signature: ES256 over the RFC 8785 canonical predicate, without <code>value</code>. It carries the public key as a JWK, so the SBOM stays verifiable after it is extracted from the envelope."
  },
  "vq-key": {
   "field": "key_id",
   "body": "The producer key you expect. Verification is pinned to it. An envelope signed by any other key fails with <code>key_mismatch</code>."
  },
  "vq-att": {
   "field": "attestation",
   "body": "The envelope as a JSON <strong>object</strong>, unchanged. Sending it as a quoted string or wrapped in another field fails with <code>invalid_body</code>."
  },
  "vq-digest": {
   "field": "expected_digest",
   "body": "Required. The sha256 <strong>you computed</strong> from the artifact you are about to deploy. Never copy it from the attestation, or the check proves nothing."
  },
  "vr-verified": {
   "field": "verified",
   "body": "Gate on this value. <code>true</code> means every check passed. A failure returns an error code instead, naming the first check that failed."
  },
  "vr-keytype": {
   "field": "key_type",
   "body": "<code>attestation</code> confirms the envelope was signed with a dedicated attestation key."
  },
  "vr-ptype": {
   "field": "predicate_type",
   "body": "Confirm it is the SBOM format you expect."
  },
  "vr-matched": {
   "field": "matched_subject",
   "body": "The subject your expected digest matched. Check that the name is the artifact you think you are deploying."
  },
  "vr-checks": {
   "field": "checks",
   "body": "Each layer reported separately: <code>signature</code> (the DSSE envelope), <code>payload_canonical</code> (RFC 8785 bytes), <code>subject_match</code> (your digest) and <code>predicate_signature</code> (the embedded or detached SBOM signature)."
  },
  "vr-sha": {
   "field": "statement_sha256",
   "body": "Equals the value from the sign response, which proves this is the same statement the producer signed."
  }
 },
 "decodedNotes": {
  "_type": "dp-type",
  "subject": "dp-subject",
  "predicateType": "dp-ptype",
  "predicate.signature": "dp-predsig"
 },
 "envelope": {
  "payloadType": "application/vnd.in-toto+json",
  "payload": "eyJfdHlwZSI6Imh0dHBzOi8vaW4tdG90by5pby9TdGF0ZW1lbnQvdjEiLCJwcmVkaWNhdGUiOnsiYm9tRm9ybWF0IjoiQ3ljbG9uZURYIiwiY29tcG9uZW50cyI6W3sibGljZW5zZXMiOlt7ImxpY2Vuc2UiOnsiaWQiOiJNSVQifX1dLCJuYW1lIjoiZXhhbXBsZS1saWJyYXJ5IiwicHVybCI6InBrZzptYXZlbi9vcmcuZXhhbXBsZS9leGFtcGxlLWxpYnJhcnlAMi4wLjAiLCJ0eXBlIjoibGlicmFyeSIsInZlcnNpb24iOiIyLjAuMCJ9XSwiZGVwZW5kZW5jaWVzIjpbeyJkZXBlbmRzT24iOltdLCJyZWYiOiJwa2c6bWF2ZW4vb3JnLmV4YW1wbGUvZXhhbXBsZS1saWJyYXJ5QDIuMC4wIn1dLCJtZXRhZGF0YSI6eyJjb21wb25lbnQiOnsibmFtZSI6IkV4YW1wbGUgQXBwbGljYXRpb24iLCJ0eXBlIjoiYXBwbGljYXRpb24iLCJ2ZXJzaW9uIjoiMS4wLjAifSwidGltZXN0YW1wIjoiMjAyNC0xMC0yMlQxMjowMDowMFoiLCJ0b29scyI6W3sibmFtZSI6IlNCT00gR2VuZXJhdG9yIiwidmVuZG9yIjoiQUNNRSBDb3JwIiwidmVyc2lvbiI6IjEuMC4wIn1dfSwic2VyaWFsTnVtYmVyIjoidXJuOnV1aWQ6MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwIiwic2lnbmF0dXJlIjp7ImFsZ29yaXRobSI6IkVTMjU2Iiwia2V5SWQiOiJiOWU1N2ExNi05ODIyLTRjODEtOTA5Mi00MzQyZDUwMjQ2YmMiLCJwdWJsaWNLZXkiOnsiY3J2IjoiUC0yNTYiLCJrdHkiOiJFQyIsIngiOiJIczZLbG9PM2ZZZmt1ZFFadG56LWRxY2gxTnlmWkZOcWtMWVFJdmlSWFNNIiwieSI6IklpRkNYWW1pdE5oTlRqM19RbDZaRVZsdzdiT2IzT0RkUmZHSm1kaEk4b28ifSwidmFsdWUiOiJNRVVDSURYazU5ZXNBQ1hxQ3VuenZqOFdvSWo3WDczdFlCZUFvRjNWb0RXbXpySXJBaUVBMnE1MjlvWkhnSEh6YmRGWGhCbTQ3X2ZqSGZJamh0dUdkMmlCZTZ4cTNJcyJ9LCJzcGVjVmVyc2lvbiI6IjEuNiIsInZlcnNpb24iOjF9LCJwcmVkaWNhdGVUeXBlIjoiaHR0cHM6Ly9jeWNsb25lZHgub3JnL2JvbSIsInN1YmplY3QiOlt7ImRpZ2VzdCI6eyJzaGEyNTYiOiJhM2Y1YzFkMmU0YjZhNzk4MGYxZTJkM2M0YjVhNjk3ODg3OTZhNWI0YzNkMmUxZjAwMTEyMjMzNDQ1NTY2Nzc4In0sIm5hbWUiOiJyZWdpc3RyeS5leGFtcGxlLmNvbS9hcHAifV19",
  "signatures": [
   {
    "keyid": "b9e57a16-9822-4c81-9092-4342d50246bc",
    "sig": "MEUCIANkgjvjp2mZ/hEIqcEmxzkgYAI/I9TWJaK+ytfqUhIEAiEA/MJoGFxuV4RmYij4gqkMVOdcfd7t0ftrYaAin24NIVw="
   }
  ]
 },
 "digest": "a3f5c1d2e4b6a7980f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778"
};

  var PAYLOAD_TYPE = "application/vnd.in-toto+json";
  var STATEMENT_TYPE = "https://in-toto.io/Statement/v1";
  var PREDICATE_TYPES = [
    "https://cyclonedx.org/bom",
    "https://spdx.dev/Document",
    "https://shiftleftcyber.io/attestation/ai-sbom/v1"
  ];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- bytes / base64 ---------------- */
  var enc = new TextEncoder();
  var dec = new TextDecoder("utf-8", { fatal: true });

  function b64ToBytes(s) {
    s = String(s).replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
    while (s.length % 4) s += "=";
    var bin = atob(s);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function bytesToB64(bytes) {
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ("0" + b.toString(16)).slice(-2);
    }).join("");
  }
  function concat(parts) {
    var len = parts.reduce(function (n, p) { return n + p.length; }, 0);
    var out = new Uint8Array(len), off = 0;
    parts.forEach(function (p) { out.set(p, off); off += p.length; });
    return out;
  }

  /* RFC 8785 (JCS): sorted keys (UTF-16 code unit order), no whitespace, ES number/string serialization. */
  function canonicalize(v) {
    if (v === null || typeof v !== "object") return JSON.stringify(v);
    if (Array.isArray(v)) return "[" + v.map(canonicalize).join(",") + "]";
    return "{" + Object.keys(v).sort().map(function (k) {
      return JSON.stringify(k) + ":" + canonicalize(v[k]);
    }).join(",") + "}";
  }

  /* DSSE pre-authentication encoding */
  function pae(type, payload) {
    var t = enc.encode(type);
    return concat([enc.encode("DSSEv1 " + t.length + " "), t, enc.encode(" " + payload.length + " "), payload]);
  }

  /* ASN.1 DER ECDSA signature -> IEEE P1363 (r||s), as Web Crypto expects */
  function derToRaw(der) {
    var i = 0;
    if (der[i++] !== 0x30) throw new Error("signature is not DER encoded");
    var len = der[i++];
    if (len & 0x80) i += len & 0x7f;
    function readInt() {
      if (der[i++] !== 0x02) throw new Error("malformed DER integer");
      var l = der[i++];
      var v = der.slice(i, i + l); i += l;
      while (v.length > 32 && v[0] === 0) v = v.slice(1);
      if (v.length > 32) throw new Error("integer too long for P-256");
      var out = new Uint8Array(32); out.set(v, 32 - v.length);
      return out;
    }
    return concat([readInt(), readInt()]);
  }

  function importKey(src) {
    var alg = { name: "ECDSA", namedCurve: "P-256" };
    if (typeof src === "object") {
      var jwk = { kty: src.kty, crv: src.crv, x: src.x, y: src.y, ext: true };
      return crypto.subtle.importKey("jwk", jwk, alg, false, ["verify"]);
    }
    var text = String(src).trim();
    if (text.charAt(0) === "{") return importKey(JSON.parse(text));
    var body = text.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").replace(/\s+/g, "");
    return crypto.subtle.importKey("spki", b64ToBytes(body), alg, false, ["verify"]);
  }

  function es256Verify(key, derSig, data) {
    return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, derToRaw(derSig), data);
  }

  /* ---------------- explorer ---------------- */
  var activeTab = "sign-request";
  var decoded = false;

  function truncate(s) {
    if (s.length <= 64) return s;
    return s.slice(0, 36) + "…" + s.slice(-10);
  }

  function renderJSON(value, path, indent, notes, numbers) {
    var pad = "  ".repeat(indent);
    if (value && typeof value === "object" && value.__decoded) {
      return '<span class="att-decoded-tag">/* base64-decoded payload */</span> ' +
        renderJSON(value.value, path, indent, notes, numbers);
    }
    if (Array.isArray(value)) {
      if (!value.length) return "[]";
      return "[\n" + value.map(function (item) {
        return pad + "  " + renderJSON(item, path + "[]", indent + 1, notes, numbers);
      }).join(",\n") + "\n" + pad + "]";
    }
    if (value && typeof value === "object") {
      var keys = Object.keys(value);
      if (!keys.length) return "{}";
      return "{\n" + keys.map(function (k) {
        var p = path ? path + "." + k : k;
        var keyHtml = '<span class="att-k">"' + esc(k) + '"</span>';
        if (notes[p]) {
          keyHtml = '<button type="button" class="att-key" data-note="' + notes[p] + '">' +
            '<span class="att-badge">' + numbers[notes[p]] + "</span>" + keyHtml + "</button>";
        }
        return pad + "  " + keyHtml + ": " + renderJSON(value[k], p, indent + 1, notes, numbers);
      }).join(",\n") + "\n" + pad + "}";
    }
    if (typeof value === "string") {
      var t = truncate(value);
      return '<span class="att-s"' + (t !== value ? ' title="' + esc(value) + '"' : "") + '>"' + esc(t) + '"</span>';
    }
    return '<span class="att-n">' + esc(JSON.stringify(value)) + "</span>";
  }

  function withDecodedPayload(obj, envPath) {
    var copy = JSON.parse(JSON.stringify(obj));
    var env = envPath.split(".").reduce(function (o, k) { return o[k]; }, copy);
    env.payload = { __decoded: true, value: JSON.parse(dec.decode(b64ToBytes(env.payload))) };
    return copy;
  }

  function setTab(name) {
    activeTab = name;
    var tab = DATA.tabs[name];
    document.querySelectorAll(".att-tab").forEach(function (b) {
      var on = b.getAttribute("data-tab") === name;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".att-flow-step").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-tab") === name);
    });
    $("att-endpoint").textContent = tab.endpoint;
    $("att-decode-wrap").style.display = tab.envelopePath ? "" : "none";

    var notes = Object.assign({}, tab.notes);
    var obj = tab.body;
    if (tab.envelopePath && decoded) {
      obj = withDecodedPayload(obj, tab.envelopePath);
      Object.keys(DATA.decodedNotes).forEach(function (k) {
        notes[tab.envelopePath + ".payload." + k] = DATA.decodedNotes[k];
      });
    }
    var order = [];
    Object.keys(notes).forEach(function (p) { if (order.indexOf(notes[p]) < 0) order.push(notes[p]); });
    var numbers = {};
    order.forEach(function (id, i) { numbers[id] = i + 1; });

    $("att-code").innerHTML = renderJSON(obj, "", 0, notes, numbers);
    $("att-notes").innerHTML = order.map(function (id) {
      var n = DATA.notes[id];
      return '<div class="att-note" data-note="' + id + '" tabindex="0">' +
        '<span class="att-badge">' + numbers[id] + "</span>" +
        '<div><p class="att-note-title"><code>' + esc(n.field) + "</code></p>" +
        '<p class="att-note-body">' + n.body + "</p></div></div>";
    }).join("");
  }

  function highlight(id, scrollNote) {
    document.querySelectorAll(".att-key, .att-note").forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-note") === id);
    });
    if (scrollNote) {
      var n = document.querySelector('.att-note[data-note="' + id + '"]');
      var panel = $("att-notes");
      if (n && panel) panel.scrollTop = n.offsetTop - panel.offsetTop - 8;
    }
  }

  /* ---------------- live verification ---------------- */
  var syncing = false;

  function loadExample() {
    $("att-envelope").value = JSON.stringify(DATA.envelope, null, 2);
    $("att-expected").value = DATA.digest;
    $("att-pubkey").value = "";
    envelopeChanged();
    run();
  }

  function envelopeChanged() {
    if (syncing) return;
    try {
      var env = JSON.parse($("att-envelope").value);
      syncing = true;
      $("att-payload").value = dec.decode(b64ToBytes(env.payload));
    } catch (e) { /* leave payload as-is while the envelope is being edited */ }
    syncing = false;
    markStale();
  }

  function payloadChanged() {
    if (syncing) return;
    try {
      var env = JSON.parse($("att-envelope").value);
      env.payload = bytesToB64(enc.encode($("att-payload").value));
      syncing = true;
      $("att-envelope").value = JSON.stringify(env, null, 2);
    } catch (e) { /* envelope not parseable; nothing to re-encode into */ }
    syncing = false;
    markStale();
  }

  function markStale() {
    var v = $("att-verdict");
    if (!v.classList.contains("att-verdict-idle")) {
      v.className = "att-verdict att-verdict-idle";
      v.textContent = "Input changed. Run the checks again.";
    }
  }

  function tamper(kind) {
    var env;
    try { env = JSON.parse($("att-envelope").value); } catch (e) { loadExample(); env = JSON.parse($("att-envelope").value); }
    var st;
    try { st = JSON.parse(dec.decode(b64ToBytes(env.payload))); } catch (e) { st = null; }
    function setStatement(text) { env.payload = bytesToB64(enc.encode(text)); }

    if (kind === "sbom" && st) {
      var comps = st.predicate && st.predicate.components;
      if (comps && comps.length) comps[0].version = comps[0].version === "2.0.1" ? "2.0.2" : "2.0.1";
      else st.predicate.tampered = true;
      setStatement(canonicalize(st));
    } else if (kind === "subject" && st) {
      var d = st.subject[0].digest.sha256;
      st.subject[0].digest.sha256 = (d.charAt(0) === "b" ? "c" : "b") + d.slice(1);
      setStatement(canonicalize(st));
    } else if (kind === "pretty" && st) {
      setStatement(JSON.stringify(st, null, 2));
    } else if (kind === "ptype" && st) {
      st.predicateType = "https://example.com/my-custom-predicate";
      setStatement(canonicalize(st));
    } else if (kind === "sig") {
      var s = env.signatures[0].sig, i = 24;
      env.signatures[0].sig = s.slice(0, i) + (s.charAt(i) === "A" ? "B" : "A") + s.slice(i + 1);
    } else if (kind === "digest") {
      var e = $("att-expected").value.trim();
      $("att-expected").value = (e.slice(-1) === "0" ? e.slice(0, -1) + "1" : e.slice(0, -1) + "0");
    }
    syncing = true;
    $("att-envelope").value = JSON.stringify(env, null, 2);
    syncing = false;
    envelopeChanged();
    run();
  }

  /* checks run in the same order the API evaluates them */
  var CHECKS = [
    { id: "digest", label: "Expected digest provided", code: "expected_digest_required" },
    { id: "envelope", label: "DSSE envelope is well formed", code: "invalid_envelope" },
    { id: "signature", label: "Envelope signature (ES256 over the PAE)", code: "signature_invalid" },
    { id: "canonical", label: "Payload is RFC 8785 canonical JSON", code: "payload_not_canonical" },
    { id: "statement", label: "Payload is an in-toto Statement v1", code: "invalid_statement" },
    { id: "ptype", label: "Predicate type is supported", code: "unsupported_predicate_type" },
    { id: "subject", label: "A subject digest matches your artifact", code: "subject_mismatch" },
    { id: "predicate", label: "SBOM signature (embedded predicate signature)", code: "predicate_signature_invalid" }
  ];

  async function evaluate() {
    var r = {};
    var expected = $("att-expected").value.trim().toLowerCase();
    r.digest = /^[0-9a-f]{64}$/.test(expected)
      ? { ok: true, detail: "Comparing against " + expected.slice(0, 12) + "…" }
      : { ok: false, detail: expected ? "Must be 64 hex characters." : "Hash the artifact you are about to use and enter its sha256." };

    var env;
    try { env = JSON.parse($("att-envelope").value); } catch (e) {
      r.envelope = { ok: false, detail: "Not valid JSON: " + e.message };
      return r;
    }
    if (!env || typeof env !== "object" || Array.isArray(env)) { r.envelope = { ok: false, detail: "The attestation must be a JSON object, not a string or array." }; return r; }
    if (env.payloadType !== PAYLOAD_TYPE) { r.envelope = { ok: false, detail: "payloadType must be " + PAYLOAD_TYPE + "." }; return r; }
    if (typeof env.payload !== "string" || !Array.isArray(env.signatures) || !env.signatures.length || !env.signatures[0].sig) {
      r.envelope = { ok: false, detail: "Needs a base64 payload and at least one signature." }; return r;
    }
    var payload, text;
    try { payload = b64ToBytes(env.payload); text = dec.decode(payload); } catch (e) {
      r.envelope = { ok: false, detail: "payload is not valid base64 UTF-8." }; return r;
    }
    r.envelope = { ok: true, detail: "keyid " + (env.signatures[0].keyid || "(none)") };
    r.statementSha = hex(await crypto.subtle.digest("SHA-256", payload));

    var st = null;
    try { st = JSON.parse(text); } catch (e) { /* reported by canonical/statement */ }

    var userKey = $("att-pubkey").value.trim();
    var embedded = st && st.predicate && st.predicate.signature && st.predicate.signature.publicKey;
    var key = null, keySource = "";
    try {
      if (userKey) { key = await importKey(userKey); keySource = "the public key you supplied"; }
      else if (embedded) { key = await importKey(embedded); keySource = "the key embedded in the SBOM signature"; }
    } catch (e) {
      r.signature = { ok: false, detail: "Could not load the public key: " + e.message };
    }
    if (!r.signature) {
      if (!key) r.signature = { ok: null, detail: "No public key available. Paste the producer's public key to check this." };
      else {
        try {
          var good = await es256Verify(key, b64ToBytes(env.signatures[0].sig), pae(env.payloadType, payload));
          r.signature = good
            ? { ok: true, detail: "Verified with " + keySource + "." }
            : { ok: false, detail: "The signature does not match these payload bytes. Something changed after signing." };
        } catch (e) { r.signature = { ok: false, detail: "Signature could not be parsed: " + e.message }; }
      }
    }

    if (!st) {
      r.canonical = { ok: false, detail: "The payload is not valid JSON." };
      r.statement = { ok: false, detail: "The payload is not valid JSON." };
      return r;
    }
    var canon = canonicalize(st);
    r.canonical = canon === text
      ? { ok: true, detail: "Byte-for-byte identical to its RFC 8785 form." }
      : { ok: false, detail: "Re-serialized: " + (text.length - canon.length) + " extra bytes (whitespace or key order) compared with the canonical form." };

    var subjOk = Array.isArray(st.subject) && st.subject.length && st.subject.every(function (s) {
      return s && typeof s.name === "string" && s.digest && /^[0-9a-f]{64}$/.test(s.digest.sha256 || "");
    });
    if (st._type !== STATEMENT_TYPE) r.statement = { ok: false, detail: "_type must be " + STATEMENT_TYPE + "." };
    else if (!subjOk) r.statement = { ok: false, detail: "Every subject needs a name and a sha256 digest." };
    else if (typeof st.predicateType !== "string" || !st.predicate || typeof st.predicate !== "object") r.statement = { ok: false, detail: "predicateType and predicate are required." };
    else r.statement = { ok: true, detail: st.subject.length + " subject(s), predicate " + st.predicateType };
    if (!r.statement.ok) return r;

    r.ptype = PREDICATE_TYPES.indexOf(st.predicateType) >= 0
      ? { ok: true, detail: st.predicateType }
      : { ok: false, detail: st.predicateType + " is not CycloneDX, SPDX or AI-SBOM." };

    if (r.digest.ok) {
      var match = st.subject.filter(function (s) { return s.digest.sha256 === expected; })[0];
      r.subject = match
        ? { ok: true, detail: "Matched " + match.name + "." }
        : { ok: false, detail: "No subject has your digest. This attestation is not for the artifact you have." };
    } else r.subject = { ok: null, detail: "Needs an expected digest." };

    var psig = st.predicate.signature;
    if (!psig || !psig.value) {
      r.predicate = { ok: null, detail: "No embedded signature (detached or none mode). The envelope signature still covers the SBOM." };
    } else {
      try {
        var pkey = userKey ? key : await importKey(psig.publicKey);
        var unsigned = JSON.parse(JSON.stringify(st.predicate));
        delete unsigned.signature.value;
        var ok = await es256Verify(pkey, b64ToBytes(psig.value), enc.encode(canonicalize(unsigned)));
        r.predicate = ok
          ? { ok: true, detail: "The SBOM inside the statement is unchanged." }
          : { ok: false, detail: "The SBOM content changed after it was signed." };
      } catch (e) { r.predicate = { ok: false, detail: "Could not check: " + e.message }; }
    }
    return r;
  }

  async function run() {
    var verdict = $("att-verdict"), list = $("att-results");
    if (!window.crypto || !crypto.subtle) {
      verdict.className = "att-verdict att-verdict-fail";
      verdict.textContent = "Web Crypto is unavailable. Open this page over https in a modern browser.";
      return;
    }
    var r = await evaluate();
    var firstFail = null;
    list.innerHTML = CHECKS.map(function (c) {
      var res = r[c.id];
      var cls = !res ? "skip" : res.ok === true ? "pass" : res.ok === false ? "fail" : "skip";
      if (cls === "fail" && !firstFail) firstFail = c;
      var icon = { pass: "✓", fail: "✗", skip: "–" }[cls];
      return '<li class="att-result att-result-' + cls + '"><span class="att-result-icon">' + icon + "</span><div>" +
        '<p class="att-result-label">' + esc(c.label) + (cls === "fail" ? ' <code>' + c.code + "</code>" : "") + "</p>" +
        '<p class="att-result-detail">' + esc(res ? res.detail : "Not reached.") + "</p></div></li>";
    }).join("");
    var sha = r.statementSha ? '<span class="att-sha">statement_sha256 ' + r.statementSha + "</span>" : "";
    if (firstFail) {
      verdict.className = "att-verdict att-verdict-fail";
      verdict.innerHTML = "<strong>verified: false</strong> &middot; the API would return <code>" + firstFail.code + "</code>" + sha;
    } else {
      verdict.className = "att-verdict att-verdict-pass";
      verdict.innerHTML = "<strong>verified: true</strong> &middot; every check passed" + sha;
    }
  }

  /* ---------------- wire up ---------------- */
  function init() {
    if (!$("attestation-guide")) return;
    document.querySelectorAll(".att-tab").forEach(function (b) {
      b.addEventListener("click", function () { setTab(b.getAttribute("data-tab")); });
    });
    document.querySelectorAll(".att-flow-step").forEach(function (b) {
      b.addEventListener("click", function () {
        setTab(b.getAttribute("data-tab"));
        $("att-explorer").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    $("att-decode").addEventListener("change", function (e) { decoded = e.target.checked; setTab(activeTab); });
    $("att-code").addEventListener("click", function (e) {
      var k = e.target.closest(".att-key");
      if (k) highlight(k.getAttribute("data-note"), true);
    });
    $("att-notes").addEventListener("click", function (e) {
      var n = e.target.closest(".att-note");
      if (n) highlight(n.getAttribute("data-note"), false);
    });
    $("att-envelope").addEventListener("input", envelopeChanged);
    $("att-payload").addEventListener("input", payloadChanged);
    $("att-expected").addEventListener("input", markStale);
    $("att-pubkey").addEventListener("input", markStale);
    $("att-run").addEventListener("click", run);
    $("att-reset").addEventListener("click", loadExample);
    document.querySelectorAll("[data-tamper]").forEach(function (b) {
      b.addEventListener("click", function () { tamper(b.getAttribute("data-tamper")); });
    });
    setTab("sign-request");
    loadExample();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

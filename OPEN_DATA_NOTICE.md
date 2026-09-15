# Open data notice

The phrase index in `data/index/` is partly derived from the openly licensed
datasets below. Only derived phrase counts (SHA-1 hashes of normalised
five-word phrases) are stored in this repository and used by the app; the
source resumes themselves are downloaded locally into `corpus/open/` (gitignored)
and are never shown to users. Contact details are stripped at import time.

| Dataset | License | Kind |
|---|---|---|
| [opensporks/resumes](https://huggingface.co/datasets/opensporks/resumes) | CC0-1.0 | Real resumes |
| [brackozi/Resume](https://huggingface.co/datasets/brackozi/Resume) | MIT | Real resumes |
| [InferencePrince555/Resume-Dataset](https://huggingface.co/datasets/InferencePrince555/Resume-Dataset) | Apache-2.0 | Real resumes |
| [hehhe89/resumes](https://huggingface.co/datasets/hehhe89/resumes) | MIT | Real resumes (structured) |
| [AzharAli05/Resume-Screening-Dataset](https://huggingface.co/datasets/AzharAli05/Resume-Screening-Dataset) | MIT | AI-generated |
| [asenion-ai/sampled-local-resumes](https://huggingface.co/datasets/asenion-ai/sampled-local-resumes) | Apache-2.0 | AI-generated |
| [burberg92/resume_summary](https://huggingface.co/datasets/burberg92/resume_summary) | Unlicense | AI-generated |
| [LithiVR/Resumes](https://huggingface.co/datasets/LithiVR/Resumes) | Apache-2.0 | Sample/template resumes |

Licenses are as declared by each dataset's publisher on Hugging Face. Copyright
in the underlying resumes remains with their authors; if you are the author of a
resume in one of these datasets and want its phrases removed from our index,
write to privacy@getshortlisted.in.

Per-source counts (kept, duplicates removed, domains) are in
`data/index/open-sources.json` and shown publicly at `/sources`.

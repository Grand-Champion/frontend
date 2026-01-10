<script>
  import { language, t } from "$lib/stores/language";
  import ImageInput from "./ImageInput.svelte";
  import { theme } from "$lib/stores/theme";

  const { message, user, forest } = $props();
</script>

<div class="form-stack">
    <div class="scroll-container">
    <input type="hidden" name="foodForestId" id="forest" value={forest.id}/>


    <div class="form-box message-box">
        <label for="message">{t("message", $language)}</label>
    <!-- <input type="text" name="message" id="message" value={message?.message} class="border rounded-l" /> -->
        <textarea name="message" id="message" rows="5">{message?.message}</textarea>
    </div>


    <div class="form-box">
        <label>Image</label>
    <ImageInput image={message?.image} />
    </div>

    <div class="form-actions">
        <input type="submit" value="{t("save", $language)}" class="submit-button">
    </div>
</div>
</div>

{#if $theme === "light"}
  <style>
    .form-box {
      background: #ffffff;
      border: 1px solid #e5e7eb;
    }

    label {
      color: #374151;
    }

    input,
    textarea {
      background: #ffffff;
      color: #111827;
      border: 1px solid #d1d5db;
    }

    input:focus,
    textarea:focus {
      border-color: #22c55e;
      box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15);
    }
  </style>
{:else}
  <style>
    .form-box {
      background: #031203;
      border: 1px solid rgba(34, 197, 94, 0.2);
      box-shadow:
        0 10px 28px rgba(0, 0, 0, 0.7),
        inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    label {
      color: #d1fae5;
    }

    input,
    textarea {
      background: #041a05;
      color: #ecfdf5;
      border: 1px solid rgba(34, 197, 94, 0.25);
    }

    input::placeholder,
    textarea::placeholder {
      color: #6ee7b7;
    }

    input:focus,
    textarea:focus {
      border-color: #22c55e;
      box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
    }
  </style>
{/if}

<style>
  .scroll-container {
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    padding-bottom: 2rem;
  }

  /*Layout*/
  .form-stack {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 520px;
    max-height: none;
    overflow-y: auto;
  }

  /*Box Wrapper*/
  .form-box {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    padding: 0.9rem 1rem;
    border-radius: 10px;
    transition: box-shadow 0.15s ease, background 0.15s ease;
  }

  /*Labels*/
  label {
    font-size: 0.85rem;
    font-weight: 600;
  }

  /*Inputs*/
  input,
  textarea {
    font-size: 0.95rem;
    padding: 0.55rem 0.65rem;
    border-radius: 6px;
    outline: none;
    width: 100%;
  }

  /*Message (larger box)*/
  .message-box textarea {
    min-height: 120px;
    resize: vertical;
  }

  /*Actions*/
  .form-actions {
    margin-top: 0.5rem;
  }

  .submit-button {
    width: 100%;
    padding: 0.7rem 1rem;

    border-radius: 10px;
    border: none;

    background: #16a34a;
    color: white;

    font-size: 0.95rem;
    font-weight: 600;

    cursor: pointer;
    transition: background 0.15s ease;
  }

  .submit-button:hover {
    background: #15803d;
  }
</style>
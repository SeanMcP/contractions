<script>
  import { get, reset, set } from "./storage-utils";
  let endTime,
    interval,
    recordCache = [],
    startTime,
    time = 0;

  const RATINGS = [1, 2, 3];

  function startTimer() {
    startTime = new Date().getTime();
    time = 0;
    interval = setInterval(() => {
      time++;
    }, 1000);
  }

  function stopTimer() {
    endTime = new Date().getTime();
    clearInterval(interval);
    addRecord(startTime, endTime);
    updateRecordCache();
  }

  function addRecord(start, end) {
    const newRecordCache = [...recordCache, { end, start, rating: 1 }];
    set(newRecordCache);
  }

  function updateRecordCache() {
    recordCache = get();
  }

  function updateRating(index, rating) {
    const newRecordCache = JSON.parse(JSON.stringify(recordCache));
    newRecordCache[index].rating = rating;
    set(newRecordCache);
    updateRecordCache();
  }

  function resetApp() {
    reset();
    endTime = undefined;
    startTime = undefined;
    time = 0;
    clearInterval(interval);
    updateRecordCache();
  }

  updateRecordCache();
</script>

<style>
  label {
    display: inline;
  }
  label + label {
    margin-left: 2px;
  }
  label .emoji {
    --size: 24px;
    align-items: center;
    border: 1px solid white;
    border-radius: var(--size);
    box-shadow: 1px 1px 2px hsla(0, 0%, 0%, 25%);
    display: inline-flex;
    height: var(--size);
    justify-content: center;
    width: var(--size);
  }

  label[aria-current="step"] .emoji {
    background-color: dodgerblue;
  }
</style>

<main>
  <h1>Contraction Tracker</h1>
  <button on:click={startTimer}>Start</button>
  <button on:click={stopTimer}>Stop</button>
  <p>{time}</p>
  {#if recordCache.length > 0}
    <ol>
      {#each recordCache as record, index}
        <li>
          {Math.floor((record.end - record.start) / 1000)}
          <span>
            {#each RATINGS as rating}
              <label aria-current={record.rating === rating ? 'step' : null}>
                <span class="visually-hidden">Rating {rating}</span>
                <span class="emoji">⚡️</span>
                <input
                  class="visually-hidden"
                  name={record.start}
                  on:change={() => updateRating(index, rating)}
                  type="radio"
                  value={rating} />
              </label>
            {/each}
          </span>
        </li>
      {/each}
    </ol>
  {/if}
  <button on:click={resetApp}>Reset</button>
</main>

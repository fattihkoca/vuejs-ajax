<template>
    <div class="vue-ajax">
        <h1 class="header">
          <span>Vue</span><span>.ajax</span>
        </h1>
        <div class="menu">
          <span class="button-container" v-for="button in buttons" :key="button.type"  :class="{'button-current' : currentButton.type == button.type}">
              <label v-if="button.type == 'file'" :for="button.type" @click="currentButton = button; responseData={}; responseData.title = 'Waiting file(s)'; responseData.subtitle='Please select file(s)'" class="button">
                  {{ button.label }}
              </label>
              <label v-else @click.prevent="fetchData(button)" class="button">
                  {{ button.label }}
              </label>
          </span>
        </div>

        <input name="images" id="file" type="file" multiple accept="image/*" @change="fetchData(currentButton)">

        <div class="results" :class="{'result-error' : responseError}">
            <div class="rel-parameter">
              Send this: <input id="rel-parameter" v-model="relParameter">
            </div>
            <div v-if="responseData">
              <div class="result-texts">
                <h2>
                  {{responseData.title}}
                  </h2>
                <h3>
                  {{ !responseError ? 'Parameter' : 'Response status' }}: 
                  {{responseData.subtitle}}
                </h3>
                <h4>
                  {{ responseData.time }}
                </h4>
              </div>

              <div class="result-images-container">  
                <div v-if="responseData.images" v-for="(image, index) in responseData.images" :key="index" class="result-image-container">
                    <img :src="image[1]">
                    <p>{{ image[0] }}</p>
                </div>
              </div>
            </div>
            <div v-else>
                <span class="result-loading">
                    Loading...
                </span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      hostname: "http://localhost:3000/vue-ajax/",
      buttons: [
        {
          type: "get",
          label: "GET"
        },
        {
          type: "file",
          label: "FILE UPLOAD (POST)"
        },
        {
          type: "jsonp",
          label: "JSONP"
        }
      ],
      currentButton: {},
      responseData: null,
      responseDataError: {
        title: "Something went wrong"
      },
      responseError: null,
      fileInputSelector: "#file",
      relParameter: 'Something',
    };
  },
  computed: {
    fileInput() {
      return document.querySelector(this.fileInputSelector);
    }
  },
  mounted() {
    // Trigger first button
    this.fetchData(this.buttons[0]);
  },
  methods: {
    prepareForm(button) {
      this.currentButton = button;
      this.responseData = null;
      this.responseError = null;

      if (this.currentButton.type != "file") {
        document.querySelector("input[type=file]").value = "";
      }

      return this.hostname + this.currentButton.type;
    },
    prepareResponse(status, response) {
      if (status) {
        this.responseData = response.data;
      } else {
        this.responseData = this.responseDataError;
        this.responseData.subtitle = response.statusText;
        this.responseError = true;
      }
    },
    fetchData(button) {
      var self = this,
        url = this.prepareForm(button);

      switch (button.type) {
        case "jsonp":
          Vue.ajax
            .jsonp(url, {
              relParameter: self.relParameter
            })
            .then(
              function(response) {
                self.prepareResponse(true, response);
              },
              function(response) {
                self.prepareResponse(false, response);
              }
            );
          break;

        case "file":
          if (!this.fileInput.value) {
            self.prepareResponse(false, {
              statusText: "You have not selected a file"
            });
            break;
          }

          Vue.ajax
            .post(url, null, {
              fileInputs: [this.fileInput],
              data: {
                relParameter: self.relParameter
              }
            })
            .then(
              function(response) {
                self.prepareResponse(true, response);
              },
              function(response) {
                self.prepareResponse(false, response);
              }
            );
          break;

        default:
          Vue.ajax
            .get(url, {
              relParameter: self.relParameter
            })
            .then(
              function(response) {
                self.prepareResponse(true, response);
              },
              function(response) {
                self.prepareResponse(false, response);
                console.log("Error", response.statusText);
              }
            );
          break;
      }
    }
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400");

body {
  background: #f8f8f8;
  font-family: "Source Sans Pro", sans-serif;
}
.vue-ajax {
  padding: 50px;
}
.vue-ajax .header {
  font-size: 40px;
  font-weight: 300;
  text-indent: 5px;
}
.vue-ajax .header span:first-child {
  color: #00bb7e;
}
.vue-ajax .header span:last-child {
  color: #304a60;
}
.vue-ajax .menu {
  margin: 30px 0;
}
.vue-ajax .button-container {
  display: inline-block;
  margin-right: 10px;
}
.vue-ajax .button-container .button {
  display: inline-block;
  position: relative;
  overflow: hidden;
  padding: 10px 25px;
  min-width: 90px;
  background: white;
  border: #00bb7e 1px solid;
  border-radius: 100px;
  color: #00bb7e;
  font-size: 16px;
  text-align: center;
  cursor: pointer;
}
.vue-ajax .button-container.button-current .button {
  background: #00bb7e;
  color: white;
}
.vue-ajax .results,
.vue-ajax .results #rel-parameter {
  padding: 20px;
  background: white;
  border: rgba(0, 0, 0, 0.1) 1px solid;
  box-shadow: rgba(0, 0, 0, 0.01) 0 5px 10px;
  border-radius: 5px;
  color: #304a60;
}
.vue-ajax .results #rel-parameter {
  display: inline-block;
  margin-left: 10px;
  padding: 8px;
  border-color: rgba(0, 0, 0, 0.1);
  font-weight: bold;
}
.vue-ajax .rel-parameter {
  margin-bottom: 10px;
  padding-bottom: 20px;
  border-bottom: rgba(0, 0, 0, 0.1) 1px solid;
}
.vue-ajax .results .result-texts {
  padding: 10px;
}
.vue-ajax .results.result-error .result-texts {
  color: #ec0033;
}
.vue-ajax .results .result-texts * {
  font-weight: normal;
}
.vue-ajax .results .result-texts h2 {
  font-size: 24px;
}
.vue-ajax .results .result-texts h3 {
  font-size: 16px;
}
.vue-ajax .results .result-texts h4 {
  font-size: 12px;
}
.vue-ajax .results .result-loading {
  font-size: 18px;
}
.vue-ajax .results .result-images-container {
  column-count: 3;
  column-gap: 20px;
}
.vue-ajax .results .result-image-container {
  position: relative;
  margin-bottom: 20px;
  overflow: hidden;
  break-inside: avoid-column;
}
.vue-ajax .results .result-image-container img {
  max-width: 100%;
}
.vue-ajax .results .result-image-container p {
  position: absolute;
  right: 0;
  bottom: 4px;
  left: 0;
  margin: 0;
  padding: 20px 10px 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: white;
  text-shadow: rgba(0, 0, 0, 0.5) 0.5px 0.5px 0;
  font-size: 16px;
  font-weight: 600;
  word-break: break-all;
}
.vue-ajax input#file {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
@media screen and (max-width: 600px) {
  .vue-ajax {
    padding: 40px 15px;
  }
  .vue-ajax .button-container {
    display: block;
    margin: 0 0 10px;
  }
  .vue-ajax .button-container .button {
    display: block;
  }
  .vue-ajax .results .result-images-container {
    column-count: 2;
    column-gap: 10px;
  }
  .vue-ajax .results .result-image-container {
    margin-bottom: 10px;
  }
  .vue-ajax .results .result-image-container p {
    font-size: 12px;
  }
}
</style>
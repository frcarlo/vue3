<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'

import { useTheme } from 'vuetify'
import appConfig from './config/appBarMenueEntries.json'
const links = appConfig.main.links
const theme = useTheme()
const route = useRoute()
const drawer = ref(JSON.parse(localStorage.getItem('drawer.menue') || false))
const rail = ref(JSON.parse(localStorage.getItem('drawer.rail') || false))

console.log(JSON.stringify(route, null, 4))
watch(drawer, (value) => {
  localStorage.setItem('drawer.menue', value)
})

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
const toggleRail = () => {
  rail.value = !rail.value
  localStorage.setItem('drawer.rail', rail.value)
}
</script>

<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent @click="rail = false">
      <!--  -->
      <v-list-item title="Sidebar" nav>
        <template v-slot:append>
          <v-btn variant="text" icon="mdi-chevron-left" @click.stop="toggleRail()"></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>
      <template v-for="(item, i) in links" :key="i">
        <v-list-item v-if="item.to" nav :to="item.to">
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>

          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-else nav :href="item.href">
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>

          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
      </template>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>Application</v-toolbar-title>
      <template v-slot:append>
        <v-btn
          @click="toggleTheme"
          :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
        ></v-btn>
        <v-menu transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" v-bind="props"> <v-icon>mdi-dots-vertical</v-icon></v-btn>
          </template>
          <v-card rounded="lg" width="200">
            <v-list>
              <v-list-item nav href="/logout">
                <template v-slot:prepend>
                  <v-icon icon="mdi-logout-variant"></v-icon>
                </template>

                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<style scoped></style>

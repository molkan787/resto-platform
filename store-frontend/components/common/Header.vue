<template>
  <Menubar role="navigation" :model="items">
    <template #start>
      <h4>Murew</h4>
    </template>
  </Menubar>
</template>

<script>
export default {
  data: () => ({
    items: [
      {
        label: "File",
        items: [
          {
            label: "New",
            items: [
              {
                label: "Bookmark",
              },
              {
                label: "Video",
              },
            ],
          },
          {
            label: "Delete",
          },
          {
            separator: true,
          },
          {
            label: "Export",
          },
        ],
      },
      {
        label: "Edit",
        items: [
          {
            label: "Left",
          },
          {
            label: "Right",
          },
          {
            label: "Center",
          },
          {
            label: "Justify",
          },
        ],
      },
      {
        label: "Users",
        items: [
          {
            label: "New",
            icon: "pi pi-fw pi-user-plus",
          },
          {
            label: "Delete",
          },
          {
            label: "Search",
            items: [
              {
                label: "Filter",
                items: [
                  {
                    label: "Print",
                  },
                ],
              },
              {
                label: "List",
              },
            ],
          },
        ],
      },
      {
        label: "Events",
        items: [
          {
            label: "Edit",
            items: [
              {
                label: "Save",
              },
              {
                label: "Delete",
              },
            ],
          },
          {
            label: "Archieve",
            items: [
              {
                label: "Remove",
              },
            ],
          },
        ],
      },
      {
        label: "Quit",
      },
    ],
  }),
};
</script>
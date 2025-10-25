import { mount } from '@vue/test-utils';
import RemainsWidget from '@/app/components/widgets/remains/RemainsWidget.vue';
import type { RemainGoodItem } from '#shared/Remains/types';
import { vi } from 'vitest';

describe('RemainsWidget', () => {
  const items: RemainGoodItem[] = [
    {
      offer_id: 'GOOD-1',
      sku: 1001,
      cluster_id: 1,
      cluster_name: 'Склад 1',
      available_stock_count: 5,
      ads: 2,
    },
    {
      offer_id: 'GOOD-2',
      sku: 1002,
      cluster_id: 2,
      cluster_name: 'Склад 2',
      available_stock_count: 7,
      ads: 1,
    },
  ];

  it('renders header and basic controls', () => {
    const wrapper = mount(RemainsWidget, {
      props: { items, goodsCount: 2 },
      global: {
        stubs: {
          UCard: { template: '<div><slot /></div>' },
          UTable: { template: '<table><slot /></table>' },
          UInput: { template: '<input />' },
          UButton: { template: '<button><slot /></button>' },
        },
      },
    });

    expect(wrapper.text()).toContain('Остатки товаров');

    // unique by sku -> 2
    expect(wrapper.text()).toContain('2 товаров');

    // unique cluster ids -> 2
    expect(wrapper.text()).toContain('2 складов / clusters');

    // search input and export button
    expect(wrapper.find('input').exists()).toBe(true);
    expect(wrapper.find('button').text()).toContain('Export CSV');
  });

  it('changes cluster header order when clicking different goods (sorting)', async () => {
    const UTableStub = {
      props: ['columns', 'data'],
      template:
        '<table>' +
        '<thead><tr>' +
        '<th v-for="c in columns" :key="c.accessorKey" class="hdr">{{ c.header }}</th>' +
        '</tr></thead>' +
        '<tbody>' +
        '<tr v-for="(r,i) in data" :key="i" data-row>' +
        '<td>' +
        '<slot name="goodId-cell" :row="{ original: r }"></slot>' +
        '</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>',
    };

    const wrapper = mount(RemainsWidget, {
      props: { items, goodsCount: 2 },
      global: {
        stubs: {
          UCard: { template: '<div><slot /></div>' },
          UTable: UTableStub,
          UInput: { template: '<input />' },
          UButton: { template: '<button><slot /></button>' },
        },
      },
    });

    const headers = () => wrapper.findAll('th.hdr').map((h) => h.text());

    // initial order should include cluster headers in base order: Склад 1 then Склад 2
    expect(headers().slice(-2)).toEqual(['Склад 1', 'Склад 2']);

    // click GOOD-2 to sort clusters by GOOD-2 stock (cluster 2 has 7, cluster 1 has 0)
    await wrapper.findAll('tbody tr td span').at(1)?.trigger('click');
    expect(headers().slice(-2)).toEqual(['Склад 2', 'Склад 1']);

    // click GOOD-1 to switch back (cluster 1 has 5)
    await wrapper.findAll('tbody tr td span').at(0)?.trigger('click');
    expect(headers().slice(-2)).toEqual(['Склад 1', 'Склад 2']);
  });

  it('filters rows by search query', async () => {
    const UTableStub = {
      props: ['columns', 'data'],
      template:
        '<table>' +
        '<tbody>' +
        '<tr v-for="(r,i) in data" :key="i" data-row><td>{{ r.goodId }}</td></tr>' +
        '</tbody>' +
        '</table>',
    };
    const UInputStub = {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template:
        '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target && $event.target.value)" />',
    };

    const wrapper = mount(RemainsWidget, {
      props: { items, goodsCount: 2 },
      global: {
        stubs: {
          UCard: { template: '<div><slot /></div>' },
          UTable: UTableStub,
          UInput: UInputStub,
          UButton: { template: '<button><slot /></button>' },
        },
      },
    });

    const rows = () => wrapper.findAll('tr[data-row]');
    expect(rows().length).toBe(2);

    // type GOOD-1 to filter
    const input = wrapper.find('input');
    await input.setValue('GOOD-1');
    expect(rows().length).toBe(1);
    expect(wrapper.find('tr[data-row]').text()).toContain('GOOD-1');
  });

  it('exports CSV with headers and semicolon delimiter', async () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');

    // capture the link to assert filename
    const appendSpy = vi.spyOn(document.body, 'appendChild');

    const wrapper = mount(RemainsWidget, {
      props: { items, goodsCount: 2 },
      global: {
        stubs: {
          UCard: { template: '<div><slot /></div>' },
          UTable: { template: '<table><slot /></table>' },
          UInput: { template: '<input />' },
          UButton: { template: '<button><slot /></button>' },
        },
      },
    });

    await wrapper.find('button').trigger('click');

    // ensure object URL was created from a Blob
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);

    const text = await blobArg.text();
    // UTF-8 BOM at start
    expect(text.charCodeAt(0)).toBe(0xfeff);

    const csv = text.slice(1); // remove BOM for assertions
    // Header should include base columns and cluster names (quoted)
    expect(csv.split('\r\n')[0]).toContain('"Товары";"Остаток";"Продажи"');
    expect(csv).toContain('Склад 1');
    expect(csv).toContain('Склад 2');

    // A link should be appended and have a download name starting with remains_
    expect(appendSpy).toHaveBeenCalled();
    const appended = appendSpy.mock.calls.find((c) => (c[0] as HTMLElement)?.tagName === 'A')?.[0];
    expect(appended).toBeTruthy();
    const linkEl = appended as HTMLAnchorElement;
    expect(linkEl.download).toMatch(/^remains_\d{4}-\d{2}-\d{2}\.csv$/);

    createObjectURLSpy.mockRestore();
    appendSpy.mockRestore();
  });
});

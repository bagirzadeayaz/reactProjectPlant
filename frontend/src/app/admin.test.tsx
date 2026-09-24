import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setAdminEnabled } from '../../test/mocks/admin-session';
import { server } from '../../test/mocks/server';
import { i18n } from '../shared/i18n';
import { renderApp } from '../../test/support/render-app';

/** The prompt 11 checkpoint and the behaviours around it. */
const heading = (name: string | RegExp) =>
  screen.findByRole('heading', { level: 1, name }, { timeout: 4000 });

const fillNewProduct = async (name: string): Promise<void> => {
  const nameGroup = screen.getByRole('group', { name: 'Name' });
  await userEvent.type(within(nameGroup).getByLabelText('English'), name);
  await userEvent.type(within(nameGroup).getByLabelText('Russian'), `${name} RU`);
  const descriptionGroup = screen.getByRole('group', { name: 'Description' });
  await userEvent.type(within(descriptionGroup).getByLabelText('English'), 'A test plant');
  await userEvent.type(within(descriptionGroup).getByLabelText('Russian'), 'Тестовое растение');
  await userEvent.clear(screen.getByLabelText('Price'));
  await userEvent.type(screen.getByLabelText('Price'), '499');
  await userEvent.selectOptions(screen.getByLabelText('Category'), 'trendy');
  await userEvent.type(screen.getByLabelText('Image URL'), '/plants/desk-plant.png');
};

describe('admin products', () => {
  beforeEach(() => {
    setAdminEnabled(true);
  });
  afterEach(async () => {
    setAdminEnabled(false);
    await i18n.changeLanguage('en');
  });

  it('lists every product with sortable columns and search', async () => {
    renderApp('/admin/products');
    await heading('Manage products');
    const table = await screen.findByRole('table', { name: 'All products' });
    expect(within(table).getAllByRole('row')).toHaveLength(7);
    expect(screen.getByTestId('admin-count')).toHaveTextContent('6 products');

    await userEvent.click(screen.getByRole('button', { name: 'Sort by Price' }));
    const firstRow = within(table).getAllByRole('row')[1];
    expect(firstRow).toHaveTextContent('Cal 874 plant');
    expect(within(table).getByRole('columnheader', { name: /Price/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );

    await userEvent.type(screen.getByLabelText('Search products'), 'desk');
    expect(within(table).getAllByRole('row')).toHaveLength(2);
    expect(screen.getByTestId('admin-count')).toHaveTextContent('1 product');
  });

  it('creates a product that appears on /catalog and the home grid without a refresh', async () => {
    const { router } = renderApp('/admin/products/new');
    await heading('New product');

    await fillNewProduct('Test fern');
    await userEvent.click(screen.getByRole('button', { name: 'Create product' }));

    await heading('Manage products');
    expect(await screen.findByText('Product created')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Test fern' })).toBeInTheDocument();

    await act(() => router.navigate('/catalog'));
    await heading('Catalog');
    expect(await screen.findByRole('heading', { level: 2, name: 'Test fern' })).toBeInTheDocument();

    await act(() => router.navigate('/'));
    await waitFor(() => {
      expect(
        screen.getAllByRole('heading', { level: 3, name: 'Test fern' }).length,
      ).toBeGreaterThan(0);
    });
  });

  it('shows translated validation from the shared schema', async () => {
    renderApp('/admin/products/new');
    await heading('New product');
    await userEvent.click(screen.getByRole('button', { name: 'Create product' }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toContain('This field is required');
    expect(screen.queryByText('Product created')).not.toBeInTheDocument();
  });

  it('warns when only one language is filled in', async () => {
    renderApp('/admin/products/new');
    await heading('New product');
    const nameGroup = screen.getByRole('group', { name: 'Name' });
    await userEvent.type(within(nameGroup).getByLabelText('English'), 'Only English');
    expect(
      screen.getByText('Russian is empty — shoppers reading Russian will see the English text.'),
    ).toBeInTheDocument();
  });

  it('edits with an optimistic update and rolls back on failure', async () => {
    const { router } = renderApp('/admin/products/p-3');
    await heading('Edit product');
    const nameGroup = await screen.findByRole('group', { name: 'Name' });
    const english = within(nameGroup).getByLabelText('English');
    await waitFor(() => {
      expect(english).toHaveValue('Desk plant');
    });

    server.use(http.patch('*/products/:id', () => HttpResponse.error()));
    await userEvent.clear(english);
    await userEvent.type(english, 'Desk plant renamed');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Could not save the product')).toBeInTheDocument();
    expect(await heading('Edit product')).toBeInTheDocument();

    // The cache was patched optimistically and undone: the catalog still says the old name.
    // The form is still dirty, so leaving goes through the guard.
    await act(() => router.navigate('/catalog'));
    const guard = await screen.findByRole('dialog', { name: 'Discard changes?' });
    await userEvent.click(within(guard).getByRole('button', { name: 'Discard and leave' }));
    await heading('Catalog');
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Desk plant' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Desk plant renamed')).not.toBeInTheDocument();
  });

  it('rolls a failed delete back and says so', async () => {
    renderApp('/admin/products');
    await heading('Manage products');
    await screen.findByRole('table', { name: 'All products' });
    server.use(http.delete('*/products/:id', () => HttpResponse.error()));

    await userEvent.click(screen.getByRole('button', { name: 'Delete Desk plant' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete Desk plant?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(
      await screen.findByText('Could not delete — the change was rolled back'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Desk plant' })).toBeInTheDocument();
    expect(screen.getByTestId('admin-count')).toHaveTextContent('6 products');
  });

  it('accepts an uploaded image and refuses the wrong kind', async () => {
    renderApp('/admin/products/new');
    await heading('New product');
    const input = screen.getByLabelText('Upload an image');

    await userEvent.upload(input, new File(['x'], 'notes.txt', { type: 'text/plain' }), {
      applyAccept: false,
    });
    expect(
      await screen.findByText('Only PNG, JPEG, WebP or GIF images can be uploaded.'),
    ).toBeInTheDocument();

    await userEvent.upload(
      input,
      new File([new Uint8Array([1, 2, 3])], 'leaf.png', { type: 'image/png' }),
    );
    const preview = await screen.findByRole('img', { name: 'Preview of the product image' });
    expect(preview).toHaveAttribute('src', expect.stringMatching(/^data:image\/png;base64,/));
    expect(screen.getByLabelText('Image URL')).toHaveValue(preview.getAttribute('src'));

    await userEvent.click(screen.getByRole('button', { name: 'Remove image' }));
    expect(screen.getByText('No image yet')).toBeInTheDocument();
  });

  it('asks before leaving a dirty form and lets the user stay', async () => {
    renderApp('/admin/products/new');
    await heading('New product');
    const nameGroup = screen.getByRole('group', { name: 'Name' });
    await userEvent.type(within(nameGroup).getByLabelText('English'), 'Draft');

    await userEvent.click(screen.getByRole('link', { name: 'Back to products' }));
    const dialog = await screen.findByRole('dialog', { name: 'Discard changes?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Keep editing' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'New product' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Back to products' }));
    const again = await screen.findByRole('dialog', { name: 'Discard changes?' });
    await userEvent.click(within(again).getByRole('button', { name: 'Discard and leave' }));
    await heading('Manage products');
  });

  it('deletes one product after confirmation and reports it', async () => {
    renderApp('/admin/products');
    await heading('Manage products');
    await screen.findByRole('table', { name: 'All products' });

    await userEvent.click(screen.getByRole('button', { name: 'Delete Desk plant' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete Desk plant?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Product deleted')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Desk plant' })).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('admin-count')).toHaveTextContent('5 products');
  });

  it('bulk deletes the selection', async () => {
    renderApp('/admin/products');
    await heading('Manage products');
    await screen.findByRole('table', { name: 'All products' });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Desk plant' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Show plant' }));
    expect(screen.getByTestId('admin-count')).toHaveTextContent('2 selected');

    await userEvent.click(screen.getByRole('button', { name: 'Delete selected' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete 2 products?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('2 products deleted')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('admin-count')).toHaveTextContent('4 products');
    });
  });
});



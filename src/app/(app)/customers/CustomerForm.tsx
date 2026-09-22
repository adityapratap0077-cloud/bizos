'use client';

import { useState } from 'react';
import { Button, Input, Modal, Textarea } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { createCustomer, updateCustomer, type CustomerInput } from '@/actions/customers';
import { validateCustomer, type FieldErrors } from '@/lib/validations';
import type { Customer } from '@/lib/types';

const EMPTY_FORM: Required<CustomerInput> = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  notes: '',
};

export default function CustomerForm({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial: Customer | null;
}) {
  const { toast } = useToast();
  const [values, setValues] = useState<Required<CustomerInput>>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form whenever the modal opens (add) or switches to a customer (edit).
  const formKey = open ? (initial?.id ?? 'new') : 'closed';
  const [lastKey, setLastKey] = useState(formKey);
  if (formKey !== lastKey) {
    setLastKey(formKey);
    setErrors({});
    setValues(
      initial
        ? {
            name: initial.name ?? '',
            email: initial.email ?? '',
            phone: initial.phone ?? '',
            company: initial.company ?? '',
            address: initial.address ?? '',
            notes: initial.notes ?? '',
          }
        : EMPTY_FORM,
    );
  }

  const set =
    (field: keyof Required<CustomerInput>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validateCustomer(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    const res = initial ? await updateCustomer(initial.id, values) : await createCustomer(values);
    setSubmitting(false);

    if (res.ok) {
      toast(initial ? 'Customer updated.' : 'Customer added.', 'success');
      onClose();
    } else {
      toast(res.error, 'error');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit customer' : 'Add customer'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            {initial ? 'Save changes' : 'Add customer'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input label="Name *" name="name" value={values.name} onChange={set('name')} error={errors.name} autoComplete="off" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Email" name="email" type="email" value={values.email} onChange={set('email')} error={errors.email} autoComplete="off" />
          <Input label="Phone" name="phone" value={values.phone} onChange={set('phone')} error={errors.phone} autoComplete="off" />
        </div>
        <Input label="Company" name="company" value={values.company} onChange={set('company')} error={errors.company} autoComplete="off" />
        <Textarea label="Address" name="address" rows={2} value={values.address} onChange={set('address')} error={errors.address} />
        <Textarea label="Notes" name="notes" rows={3} value={values.notes} onChange={set('notes')} error={errors.notes} />
      </form>
    </Modal>
  );
}

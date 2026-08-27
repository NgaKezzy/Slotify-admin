"use client";

/**
 * Detail drawer for a booking (customer, services, schedule, payment, notes)
 * with the status-machine actions at the bottom. Shared by the bookings list
 * and the calendar.
 */
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { BookingActions } from "@/components/bookings/booking-actions";
import { DateTime } from "@/components/common/date-time";
import { Money } from "@/components/common/money";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Booking } from "@/hooks/use-bookings";
import { formatDuration } from "@/lib/format";

interface BookingSheetProps {
  salonId: number;
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingSheet({ salonId, booking, open, onOpenChange }: BookingSheetProps) {
  const t = useTranslations("bookings");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        {booking ? (
          <>
            <SheetHeader>
              <SheetTitle className="flex flex-wrap items-center gap-2">
                {t("detail.title", { code: booking.code })}
                <BookingStatusBadge status={booking.status} />
              </SheetTitle>
              <SheetDescription>
                <DateTime iso={booking.startAt} /> – <DateTime iso={booking.endAt} mode="time" />
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 px-4">
              <Section title={t("detail.customer")}>
                <Row label={t("detail.customer")} value={booking.customer.fullName} />
                <Row
                  label={t("detail.contact")}
                  value={[booking.customer.email, booking.customer.phone]
                    .filter(Boolean)
                    .join(" · ")}
                />
              </Section>
              <Separator />
              <Section title={t("detail.services")}>
                <ul className="grid gap-1">
                  {booking.items.map((item) => (
                    <li key={item.serviceId} className="flex justify-between gap-2">
                      <span>
                        {item.serviceName}
                        <span className="text-muted-foreground">
                          {" "}
                          · {formatDuration(item.durationMin)}
                        </span>
                      </span>
                      <Money minor={item.priceMinor} currency={booking.currency} />
                    </li>
                  ))}
                </ul>
              </Section>
              <Separator />
              <Section title={t("detail.schedule")}>
                <Row
                  label={t("detail.staff")}
                  value={
                    <>
                      {booking.staff.displayName}
                      {booking.staffAutoAssigned ? (
                        <span className="text-muted-foreground"> ({t("detail.autoAssigned")})</span>
                      ) : null}
                    </>
                  }
                />
                <Row label={t("detail.createdAt")} value={<DateTime iso={booking.createdAt} />} />
              </Section>
              <Separator />
              <Section title={t("detail.payment")}>
                <Row
                  label={t("detail.payment")}
                  value={<PaymentStatusBadge status={booking.paymentStatus} />}
                />
                {booking.paymentMethod ? (
                  <Row
                    label={t("detail.method")}
                    value={t(`paymentMethod.${booking.paymentMethod}`)}
                  />
                ) : null}
                <Row
                  label={t("detail.subtotal")}
                  value={<Money minor={booking.subtotalMinor} currency={booking.currency} />}
                />
                {booking.discountMinor > 0 ? (
                  <Row
                    label={t("detail.discount")}
                    value={<Money minor={-booking.discountMinor} currency={booking.currency} />}
                  />
                ) : null}
                {booking.couponCode ? (
                  <Row
                    label={t("detail.coupon")}
                    value={<span className="font-mono">{booking.couponCode}</span>}
                  />
                ) : null}
                <Row
                  label={t("detail.total")}
                  value={
                    <Money
                      minor={booking.totalMinor}
                      currency={booking.currency}
                      className="font-semibold"
                    />
                  }
                />
              </Section>
              <Separator />
              <Section title={t("detail.note")}>
                <p className={booking.note ? "" : "text-muted-foreground"}>
                  {booking.note || t("detail.noNote")}
                </p>
                {booking.cancelReason ? (
                  <Row label={t("detail.cancelReason")} value={booking.cancelReason} />
                ) : null}
                {booking.cancelledBy ? (
                  <Row
                    label={t("detail.cancelledBy")}
                    value={t(`cancelledBy.${booking.cancelledBy}`)}
                  />
                ) : null}
              </Section>
              <Separator />
              <BookingActions salonId={salonId} booking={booking} />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-1.5">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- TENANT POLICIES
-- ==========================================

-- 1. Create: Tenants can insert new requests ONLY for themselves
CREATE POLICY "Tenants can insert their own requests" 
  ON public.maintenance_requests FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = tenant_id);

-- 2. Read: Tenants can view requests for properties where they are ACTIVE tenants
CREATE POLICY "Tenants can view requests for their property" 
  ON public.maintenance_requests FOR SELECT 
  TO authenticated 
  USING (
    property_id IN (
      SELECT r.property_id FROM public.rooms r
      JOIN public.tenant_memberships m ON m.room_id = r.id
      WHERE m.tenant_id = auth.uid() AND m.status = 'active'
    )
  );

-- 3. Edit: Tenants can edit their own requests, BUT cannot reassign them to someone else
CREATE POLICY "Tenants can update their own requests" 
  ON public.maintenance_requests FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = tenant_id)
  WITH CHECK (auth.uid() = tenant_id);

-- 4. Delete: Tenants can delete their own requests
CREATE POLICY "Tenants can delete their own requests" 
  ON public.maintenance_requests FOR DELETE 
  TO authenticated 
  USING (auth.uid() = tenant_id);


-- ==========================================
-- LANDLORD POLICIES
-- ==========================================

-- 5. Read: Landlords can view requests for properties they own
CREATE POLICY "Landlords can view requests for their properties" 
  ON public.maintenance_requests FOR SELECT 
  TO authenticated 
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE landlord_id = auth.uid()
    )
  );

-- 6. Update: Landlords can update requests, BUT cannot move the request to a property they don't own
CREATE POLICY "Landlords can update requests for their properties" 
  ON public.maintenance_requests FOR UPDATE 
  TO authenticated 
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE landlord_id = auth.uid()
    )
  )
  WITH CHECK (
    property_id IN (
      SELECT id FROM public.properties WHERE landlord_id = auth.uid()
    )
  );
